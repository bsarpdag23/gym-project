import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  FaChartBar, FaUsers, FaUserFriends, FaDoorOpen, FaBox, FaTicketAlt, FaDumbbell,
  FaClipboardList, FaUser, FaEdit, FaTrash, FaRobot, FaChalkboardTeacher, FaStar,
  FaCheckCircle, FaTimesCircle, FaClock, FaTrophy, FaCog, FaRunning, FaSave, FaMoneyBillWave,
  FaComments, FaPaperPlane, FaCamera,
} from 'react-icons/fa';
import { BRAND, Btn, Card, Badge, Input, Select, Modal, Logo, Avatar } from '../components/ui';
import api, { resolveAvatarUrl } from '../api';
import { getSocket } from '../socket';
import { PROGRAM_CATEGORIES, PROGRAM_CATEGORY_LABELS } from '../programCategories';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = location.pathname.split('/').filter(Boolean)[1] || '';
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [myMembers, setMyMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [enrollments, setEnr] = useState([]);
  const [exercises, setExs] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [stats, setStats] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = useCallback(async () => {
    try {
      if (tab === 'users') {
        setUsers(await api.users.getAll());
        if (user.role === 'admin') setTrainers(await api.users.getTrainers());
      }
      if (tab === 'mymembers') {
        const [m, p] = await Promise.all([api.users.getMyMembers(), api.programs.getAll()]);
        setMyMembers(m);
        setPrograms(p);
      }
      if (tab === 'plans') setPlans(await api.plans.getAll());
      if (tab === 'enrollments') setEnr(await api.enrollments.getAll());
      if (tab === 'exercises') setExs(await api.exercises.getAll());
      if (tab === 'checkin') setCheckIns(await api.checkIns.getAll());
      if (tab === 'dashboard') setStats(await api.dashboard.getStats());
      if (tab === 'programs') {
        const [p, e] = await Promise.all([api.programs.getAll(), api.exercises.getAll()]);
        setPrograms(p); setExs(e);
      }
    } catch (e) { alert(e.message); }
  }, [tab, user.role]);

  useEffect(() => { setShowScanner(false); load(); }, [tab, load]);

  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    }, false);

    scanner.render(
      async (decodedText) => {
        setScanToken(decodedText);
        setScanResult(null);
        try {
          const result = await api.checkIns.scan(decodedText);
          setScanResult({ ok: true, data: result });
          setScanToken('');
          if (tab === 'checkin') {
            const history = await api.checkIns.getAll();
            setCheckIns(history);
          }
        } catch (e) {
          setScanResult({ ok: false, message: e.message });
        }
        scanner.clear().catch(err => console.error("Scanner clear error", err));
        setShowScanner(false);
      },
      (error) => {
        // Silent error callback
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup clear error:", err));
    };
  }, [showScanner, tab]);

  const openAdd = (type) => {
    const defaults = {
      exercise: { category: 'cardio', sets: 3, reps: 12 },
      plan: { durationMonths: 1, price: 0 },
      program: { difficulty: 'beginner', weeksCount: 4, category: 'full_body' },
    };
    setForm(defaults[type] || {});
    setModal({ type, item: null });
  };
  const openEdit = (type, item) => { setForm(item); setModal({ type, item }); };

  const save = async () => {
    try {
      const t = modal.type;
      if (t === 'plan') {
        const payload = { ...form, durationMonths: +form.durationMonths, price: +form.price, ptSessionsCount: +form.ptSessionsCount || 0 };
        modal.item ? await api.plans.update(modal.item.id, payload) : await api.plans.create(payload);
      }
      if (t === 'exercise') {
        const payload = { ...form, sets: +form.sets, reps: +form.reps };
        modal.item
          ? await api.exercises.update(modal.item.id, payload)
          : await api.exercises.create(payload);
      }
      if (t === 'program') {
        const payload = { ...form, weeksCount: +form.weeksCount };
        modal.item ? await api.programs.update(modal.item.id, payload) : await api.programs.create(payload);
      }
      setModal(null); load();
    } catch (e) { alert(e.message); }
  };

  const assignTrainer = async (memberId, trainerId) => {
    try {
      await api.users.assignTrainer(memberId, trainerId ? +trainerId : null);
      load();
    } catch (e) { alert(e.message); }
  };

  const changeRole = async (userId, role) => {
    try {
      await api.users.updateRole(userId, role);
      load();
    } catch (e) { alert(e.message); }
  };

  const del = async (type, id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      if (type === 'plan') await api.plans.remove(id);
      if (type === 'exercise') await api.exercises.remove(id);
      if (type === 'program') await api.programs.remove(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const addEx = async (pid, eid) => { try { await api.programs.addExercise(pid, eid); load(); } catch (e) { alert(e.message); } };
  const dropEx = async (pid, eid) => { try { await api.programs.dropExercise(pid, eid); load(); } catch (e) { alert(e.message); } };

  const doScan = async () => {
    if (!scanToken.trim()) return;
    try {
      const result = await api.checkIns.scan(scanToken.trim());
      setScanResult({ ok: true, data: result });
      setScanToken('');
      if (tab === 'checkin') setCheckIns(await api.checkIns.getAll());
    } catch (e) {
      setScanResult({ ok: false, message: e.message });
    }
  };

  const ALL_TABS = [
    { id: 'dashboard', label: <><FaChartBar /> Dashboard</>, roles: ['admin'] },
    { id: 'users', label: <><FaUsers /> Üyeler</>, roles: ['admin', 'trainer'] },
    { id: 'mymembers', label: <><FaUserFriends /> PT Üyelerim</>, roles: ['trainer'] },
    { id: 'checkin', label: <><FaDoorOpen /> Giriş Kayıtları</>, roles: ['admin', 'trainer'] },
    { id: 'chat', label: <><FaComments /> Sohbet</>, roles: ['admin', 'trainer'] },
    { id: 'plans', label: <><FaBox /> Üyelik Paketleri</>, roles: ['admin'] },
    { id: 'enrollments', label: <><FaTicketAlt /> Üyelikler</>, roles: ['admin', 'trainer'] },
    { id: 'exercises', label: <><FaDumbbell /> Egzersizler</>, roles: ['admin', 'trainer'] },
    { id: 'programs', label: <><FaClipboardList /> Programlar</>, roles: ['admin', 'trainer'] },
  ];
  const TABS = ALL_TABS.filter(t => t.roles.includes(user.role));
  const color = { users: '#e94560', plans: '#3b82f6', enrollments: '#10b981', exercises: '#f59e0b', programs: '#8b5cf6', dashboard: '#8b5cf6', mymembers: '#8b5cf6', checkin: '#10b981', chat: '#ec4899' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Segoe UI,sans-serif' }}>
      <div style={{
        background: `linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`, padding: '14px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(233,69,96,.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Logo light />
          <Badge label={user.role === 'admin' ? 'Admin' : 'Trainer'} color="#fff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#fff' }}>
          <span style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}><FaUser /> {user.fullName}</span>
          <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => navigate(`/admin/${t.id}`)} style={{
              padding: '9px 20px', borderRadius: 10, border: `2px solid ${tab === t.id ? (color[t.id] || BRAND.primary) : '#e5e7eb'}`,
              background: tab === t.id ? (color[t.id] || BRAND.primary) : '#fff',
              color: tab === t.id ? '#fff' : '#374151',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        <Routes>
          <Route index element={<Navigate to={TABS[0]?.id || 'users'} replace />} />
          <Route path="users" element={(
            <div>
              <h2 style={{ margin: '0 0 16px' }}>Kayıtlı Kullanıcılar ({users.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.length === 0 && (
                  <Card style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FaUsers /></div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Henüz kayıtlı kullanıcı yok.</p>
                  </Card>
                )}

                {users.map(u => (
                  <Card key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{u.email}</div>
                      {u.phone && <div style={{ color: '#9ca3af', fontSize: 12 }}>{u.phone}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {user.role === 'admin' ? (
                        <div style={{ minWidth: 130 }}>
                          <Select
                            value={u.role}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            options={[
                              { value: 'member', label: 'Üye' },
                              { value: 'trainer', label: 'Trainer' },
                              { value: 'admin', label: 'Admin' },
                            ]} />
                        </div>
                      ) : (
                        <Badge
                          label={u.role === 'admin' ? 'Admin' : u.role === 'trainer' ? 'Trainer' : 'Üye'}
                          color={u.role === 'admin' ? '#e94560' : u.role === 'trainer' ? '#8b5cf6' : '#10b981'} />
                      )}

                      {user.role === 'admin' && u.role === 'member' && (
                        u.hasActivePT ? (
                          <div style={{ minWidth: 150 }}>
                            <Select
                              value={u.assignedTrainerId || ''}
                              onChange={(e) => assignTrainer(u.id, e.target.value)}
                              options={[
                                { value: '', label: '— Trainer seç —' },
                                ...trainers.map(t => ({ value: t.id, label: t.fullName })),
                              ]} />
                          </div>
                        ) : (
                          <Badge label="PT paketi yok" color="#9ca3af" />
                        )
                      )}

                      <Badge label={u.isActive ? 'Aktif' : 'Pasif'} color={u.isActive ? '#10b981' : '#6b7280'} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )} />

          <Route path="plans" element={(
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Üyelik Paketleri</h2>
                <Btn onClick={() => openAdd('plan')}>+ Yeni Paket</Btn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                {plans.length === 0 && (
                  <Card style={{ textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FaBox /></div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Henüz üyelik paketi yok. "+ Yeni Paket" ile ekleyin.</p>
                  </Card>
                )}

                {plans.map(p => (
                  <Card key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{p.name}</h3>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" color="#6b7280" outline onClick={() => openEdit('plan', p)}><FaEdit /></Btn>
                        <Btn size="sm" color={BRAND.primary} outline onClick={() => del('plan', p.id)}><FaTrash /></Btn>
                      </div>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 12px' }}>{p.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Badge label={`${p.durationMonths} Ay`} color="#3b82f6" />
                        {p.includesPersonalTraining && (
                          <Badge label={p.ptSessionsCount > 0 ? `PT (${p.ptSessionsCount} Seans)` : 'PT Dahil'} color="#8b5cf6" />
                        )}
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 700, color: BRAND.primary }}>{p.price} ₺</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )} />

          <Route path="enrollments" element={(
            <div>
              <h2 style={{ margin: '0 0 16px' }}>Tüm Üyelikler</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {enrollments.length === 0 && (
                  <Card style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FaTicketAlt /></div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Henüz üyelik satın alınmamış.</p>
                  </Card>
                )}

                {enrollments.map(e => (
                  <Card key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{e.member?.fullName}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{e.plan?.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: 12 }}>
                        {new Date(e.startDate).toLocaleDateString('tr')} → {new Date(e.endDate).toLocaleDateString('tr')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{e.amountPaid} ₺</div>
                      <Badge label={e.status === 'active' ? 'Aktif' : 'Pasif'}
                        color={e.status === 'active' ? '#10b981' : '#6b7280'} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )} />

          <Route path="exercises" element={(
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Egzersizler</h2>
                <Btn onClick={() => openAdd('exercise')} color="#f59e0b">+ Yeni Egzersiz</Btn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {exercises.length === 0 && (
                  <Card style={{ textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FaDumbbell /></div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Henüz egzersiz yok. "+ Yeni Egzersiz" ile ekleyin.</p>
                  </Card>
                )}

                {exercises.map(e => (
                  <Card key={e.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{e.name}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" color="#6b7280" outline onClick={() => openEdit('exercise', e)}><FaEdit /></Btn>
                        <Btn size="sm" color={BRAND.primary} outline onClick={() => del('exercise', e.id)}><FaTrash /></Btn>
                      </div>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 10px' }}>{e.description}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge label={e.category} color="#f59e0b" />
                      {e.equipment && <Badge label={e.equipment} color="#6b7280" />}
                      <Badge label={`${e.sets}×${e.reps}`} color="#3b82f6" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )} />

          <Route path="programs" element={(
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Antrenman Programları</h2>
                <Btn onClick={() => openAdd('program')} color="#8b5cf6">+ Yeni Program</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {programs.length === 0 && (
                  <Card style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FaClipboardList /></div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Henüz antrenman programı yok. "+ Yeni Program" ile ekleyin.</p>
                  </Card>
                )}

                {programs.map(p => (
                  <Card key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>{p.name}</h3>
                        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 10px' }}>{p.description}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Badge label={PROGRAM_CATEGORY_LABELS[p.category] || p.category} color="#3b82f6" />
                          <Badge label={p.difficulty} color="#8b5cf6" />
                          <Badge label={`${p.weeksCount} Hafta`} color="#10b981" />
                          <Badge label={p.source === 'ai' ? <><FaRobot /> AI</> : <><FaChalkboardTeacher /> Antrenör</>} color={p.source === 'ai' ? '#f59e0b' : '#6b7280'} />
                          {p.ratingCount > 0 && (
                            <button onClick={() => setModal({ type: 'ratings', item: p })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}>
                              <Badge label={<><FaStar /> {p.avgRating} ({p.ratingCount} Yorum)</>} color="#ec4899" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" color="#6b7280" outline onClick={() => openEdit('program', p)}><FaEdit /></Btn>
                        <Btn size="sm" color={BRAND.primary} outline onClick={() => del('program', p.id)}><FaTrash /></Btn>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {(p.exercises || []).map(e => (
                        <span key={e.id} style={{
                          background: BRAND.primary + '15', color: BRAND.primary,
                          border: `1px solid ${BRAND.primary}33`, borderRadius: 20, padding: '3px 10px', fontSize: 12,
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          {e.name}
                          <button onClick={() => dropEx(p.id, e.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: BRAND.primary, fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                        </span>
                      ))}
                      <select
                        defaultValue=""
                        onChange={ev => { if (ev.target.value) { addEx(p.id, +ev.target.value); ev.target.value = ''; } }}
                        style={{
                          border: '1.5px dashed #8b5cf6', background: '#8b5cf608', color: '#8b5cf6',
                          borderRadius: 20, padding: '3px 10px', fontSize: 12, cursor: 'pointer', outline: 'none'
                        }}>
                        <option value="">+ Egzersiz Ekle</option>
                        {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )} />

          <Route path="mymembers" element={(
            <div>
              <h2 style={{ margin: '0 0 16px' }}>PT Üyelerim ({myMembers.length})</h2>
              {myMembers.length === 0 && (
                <Card style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FaUserFriends /></div>
                  <p style={{ color: '#6b7280', margin: 0 }}>Henüz size atanmış bir üye yok.</p>
                </Card>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {myMembers.map(m => (
                  <Card key={m.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>{m.fullName}</h3>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>{m.email}</div>
                        {m.phone && <div style={{ color: '#9ca3af', fontSize: 12 }}>{m.phone}</div>}
                      </div>
                      {m.activeProgram && (
                        <Badge label={
                          m.activeProgram.goal === 'gain' ? 'Kilo Alma' :
                            m.activeProgram.goal === 'lose' ? 'Kilo Verme' : 'Koruma'
                        } color="#8b5cf6" />
                      )}
                    </div>

                    {m.activeEnrollment && (
                      <div style={{ marginTop: 10, marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Aktif Üyelik: {m.activeEnrollment.plan?.name}</div>
                          {m.activeEnrollment.totalPtSessions > 0 && (
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              Kalan PT Seansı: <strong style={{ color: BRAND.primary }}>{m.activeEnrollment.remainingPtSessions} / {m.activeEnrollment.totalPtSessions}</strong> ders
                            </div>
                          )}
                        </div>
                        {m.activeEnrollment.remainingPtSessions > 0 && (
                          <Btn size="sm" onClick={async () => {
                            if (window.confirm(`${m.fullName} için 1 ders düşmek istediğinize emin misiniz?`)) {
                              try {
                                await api.enrollments.decrementPt(m.activeEnrollment.id);
                                alert('PT seansı başarıyla düşüldü!');
                                load();
                              } catch (err) { alert(err.message); }
                            }
                          }}>Ders Tamamlandı (-1)</Btn>
                        )}
                      </div>
                    )}

                    {m.activeProgram ? (
                      <div style={{ background: '#faf5ff', borderRadius: 10, padding: 14 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                          <Badge label={`${m.activeProgram.startWeightKg} → ${m.activeProgram.targetWeightKg} kg`} color="#3b82f6" />
                          <Badge label={`${m.activeProgram.durationWeeks} hafta`} color="#10b981" />
                          <Badge label={`${m.activeProgram.dailyCalories} kcal`} color="#e94560" />
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                          Protein {m.activeProgram.proteinG}g · Karbonhidrat {m.activeProgram.carbsG}g · Yağ {m.activeProgram.fatG}g
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(m.activeProgram.workoutPlan || []).map(day => (
                            <div key={day.day} style={{ fontSize: 13 }}>
                              <span style={{ fontWeight: 600 }}>Gün {day.day} — {day.focus}:</span>{' '}
                              <span style={{ color: '#6b7280' }}>
                                {(day.exercises || []).map(e => e.name).join(', ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Bu üye henüz bir program oluşturmamış.</p>
                    )}

                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}><FaClipboardList /> Program Ata:</span>
                      <select
                        defaultValue=""
                        onChange={async (e) => {
                          const val = e.target.value;
                          if (!val) return;
                          if (window.confirm(`${m.fullName} isimli üyeye bu programı atamak istediğinize emin misiniz?`)) {
                            try {
                              await api.programs.assignToMember(m.id, +val);
                              alert('Program başarıyla atandı!');
                              load();
                            } catch (err) {
                              alert(err.message);
                            }
                          }
                          e.target.value = "";
                        }}
                        style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', cursor: 'pointer', background: '#fff' }}
                      >
                        <option value="">-- Program Seç --</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.weeksCount} Hafta)</option>
                        ))}
                      </select>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )} />

          <Route path="checkin" element={(
            <div>
              <h2 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><FaDoorOpen /> Üye Girişi (Check-in)</h2>

              <Card style={{ marginBottom: 20 }}>
                <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 12px' }}>
                  Üyenin QR kodunu okutun veya token'ı girin.
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      value={scanToken}
                      onChange={(e) => setScanToken(e.target.value)}
                      placeholder="QR token..."
                    />
                  </div>
                  <Btn onClick={doScan} style={{ height: 44 }}>Giriş Yap</Btn>
                </div>

                {/* QR Tarayıcı Butonu ve Arayüzü */}
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  {showScanner ? (
                    <div>
                      <div id="qr-reader" style={{ maxWidth: 350, margin: '0 auto 12px', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}></div>
                      <Btn size="sm" color="#6b7280" outline onClick={() => setShowScanner(false)}>Taramayı Kapat</Btn>
                    </div>
                  ) : (
                    <Btn outline onClick={() => { setShowScanner(true); setScanResult(null); }}>
                      <FaCamera /> Kamerayla Tara (QR Okuyucu)
                    </Btn>
                  )}
                </div>

                {scanResult && (
                  <div style={{
                    marginTop: 16, padding: '14px 18px', borderRadius: 10,
                    background: scanResult.ok ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${scanResult.ok ? '#86efac' : '#fca5a5'}`,
                  }}>
                    {scanResult.ok ? (
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FaCheckCircle /> {scanResult.data.message}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                          Paket: {scanResult.data.plan || '—'} · Geçerlilik: {scanResult.data.validUntil}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaTimesCircle /> {scanResult.message}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              <h3 style={{ margin: '0 0 12px' }}>Son Girişler ({checkIns.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {checkIns.length === 0 && (
                  <Card style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>
                    Henüz giriş kaydı yok.
                  </Card>
                )}
                {checkIns.map(c => (
                  <Card key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{c.member?.fullName || 'Bilinmeyen üye'}</div>
                    <div style={{ color: '#9ca3af', fontSize: 13 }}>
                      {new Date(c.checkInTime).toLocaleString('tr')}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )} />

          <Route path="dashboard" element={(
            <div>
              <h2 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}><FaChartBar /> Genel Bakış</h2>

              {!stats ? (
                <Card style={{ textAlign: 'center', padding: 40 }}>Yükleniyor...</Card>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
                    {[
                      { label: 'Toplam Üye', value: stats.totalMembers, icon: <FaUsers />, color: '#3b82f6' },
                      { label: 'Aktif Üyelik', value: stats.activeEnrollments, icon: <FaTicketAlt />, color: '#10b981' },
                      { label: 'Toplam Gelir', value: `${stats.totalRevenue.toLocaleString('tr')} ₺`, icon: <FaMoneyBillWave />, color: '#e94560' },
                      { label: 'Bugünkü Giriş', value: stats.todayCheckIns, icon: <FaDoorOpen />, color: '#8b5cf6' },
                    ].map(k => (
                      <Card key={k.label} style={{ borderLeft: `4px solid ${k.color}` }}>
                        <div style={{ fontSize: 28, marginBottom: 8, color: k.color }}>{k.icon}</div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{k.label}</div>
                      </Card>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
                    <Card style={{ borderLeft: '4px solid #f59e0b' }}>
                      <h3 style={{ margin: '0 0 14px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FaClock /> Salon Doluluk Özetı</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>En yoğun saatler</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(stats.occupancySummary?.peakHours || []).slice(0, 3).map((slot, i) => (
                              <div key={`${slot.day}-${slot.hour}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', borderRadius: 8, padding: '8px 10px' }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{slot.day} {slot.hour}:00</span>
                                <Badge label={`${slot.checkIns} giriş`} color="#f59e0b" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>En sakin saatler</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(stats.occupancySummary?.quietHours || []).slice(0, 3).map((slot, i) => (
                              <div key={`${slot.day}-${slot.hour}-quiet`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', borderRadius: 8, padding: '8px 10px' }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{slot.day} {slot.hour}:00</span>
                                <Badge label={`${slot.checkIns} giriş`} color="#10b981" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <h3 style={{ margin: '0 0 14px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FaTrophy /> En Popüler Paketler</h3>
                      {stats.popularPlans.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: 13 }}>Henüz satış yok.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {stats.popularPlans.map((p, i) => (
                            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontWeight: 700, color: '#9ca3af' }}>{i + 1}.</span>
                                <span style={{ fontSize: 14 }}>{p.name || 'Bilinmeyen'}</span>
                              </div>
                              <Badge label={`${p.count} satış`} color="#3b82f6" />
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    <Card>
                      <h3 style={{ margin: '0 0 14px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FaUser /> Kullanıcı Dağılımı</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {stats.roleDistribution.map(r => (
                          <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {r.role === 'admin' ? <><FaCog /> Admin</> : r.role === 'trainer' ? <><FaDumbbell /> Trainer</> : <><FaRunning /> Üye</>}
                            </span>
                            <Badge
                              label={`${r.count} kişi`}
                              color={r.role === 'admin' ? '#e94560' : r.role === 'trainer' ? '#8b5cf6' : '#10b981'} />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )} />

          <Route path="chat" element={<ChatTab user={user} />} />
          <Route path="*" element={<Navigate to={`/admin/${TABS[0]?.id || 'users'}`} replace />} />
        </Routes>
      </div>

      {modal && (
        <Modal title={`${modal.item ? 'Düzenle' : 'Yeni Ekle'} — ${modal.type === 'plan' ? 'Üyelik Paketi' : modal.type === 'exercise' ? 'Egzersiz' : 'Program'}`}
          onClose={() => setModal(null)}>

          {modal.type === 'plan' && <>
            <Input label="Paket Adı" value={form.name || ''} onChange={set('name')} />
            <Input label="Süre (Ay)" value={form.durationMonths || ''} onChange={set('durationMonths')} type="number" />
            <Input label="Fiyat (₺)" value={form.price || ''} onChange={set('price')} type="number" />
            <Input label="Açıklama" value={form.description || ''} onChange={set('description')} />
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, cursor: 'pointer',
              padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 9, background: '#faf5ff'
            }}>
              <input
                type="checkbox"
                checked={!!form.includesPersonalTraining}
                onChange={(e) => setForm({ ...form, includesPersonalTraining: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#8b5cf6' }}
              />
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Bu paketi alan üyelere trainer atanabilir</div>
              </div>
            </label>
            {form.includesPersonalTraining && (
              <div style={{ marginTop: 12 }}>
                <Input label="PT Seans Sayısı" value={form.ptSessionsCount || ''} onChange={set('ptSessionsCount')} type="number" placeholder="Örn: 12" />
              </div>
            )}
          </>}

          {modal.type === 'exercise' && <>
            <Input label="Egzersiz Adı" value={form.name || ''} onChange={set('name')} />
            <Input label="Açıklama" value={form.description || ''} onChange={set('description')} />
            <Select label="Kategori" value={form.category || 'cardio'} onChange={set('category')}
              options={[
                { value: 'cardio', label: 'Cardio' },
                { value: 'strength', label: 'Strength' },
                { value: 'flexibility', label: 'Flexibility' },
                { value: 'balance', label: 'Balance' },
              ]} />
            <Input label="Ekipman" value={form.equipment || ''} onChange={set('equipment')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Input label="Set" value={form.sets || 3} onChange={set('sets')} type="number" />
              <Input label="Tekrar" value={form.reps || 12} onChange={set('reps')} type="number" />
            </div>
          </>}

          {modal.type === 'program' && <>
            <Input label="Program Adı" value={form.name || ''} onChange={set('name')} />
            <Input label="Açıklama" value={form.description || ''} onChange={set('description')} />
            <Select label="Zorluk" value={form.difficulty || 'beginner'} onChange={set('difficulty')}
              options={[
                { value: 'beginner', label: 'Başlangıç' },
                { value: 'intermediate', label: 'Orta' },
                { value: 'advanced', label: 'İleri' },
              ]} />
            <Select label="Kategori" value={form.category || 'full_body'} onChange={set('category')}
              options={PROGRAM_CATEGORIES} />
            <Input label="Hafta Sayısı" value={form.weeksCount || 4} onChange={set('weeksCount')} type="number" />
          </>}

          {modal.type === 'ratings' && (
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                "{modal.item.name}" Programına Yapılan Yorumlar
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
                {(modal.item.ratings || []).length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', margin: 20 }}>Bu programa henüz yazılı yorum yapılmamış.</p>
                ) : (
                  (modal.item.ratings || []).map(r => (
                    <div key={r.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>
                          {r.user?.fullName || 'Bilinmeyen Üye'}
                        </span>
                        <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#334155', margin: '0 0 6px', lineHeight: 1.4 }}>
                        {r.comment || <em style={{ color: '#9ca3af' }}>Sadece puan verdi.</em>}
                      </p>
                      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
                        {new Date(r.createdAt).toLocaleDateString('tr')}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Btn style={{ marginTop: 20, width: '100%', justifyContent: 'center' }} onClick={() => setModal(null)}>Kapat</Btn>
            </div>
          )}

          {modal.type !== 'ratings' && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Btn onClick={save} style={{ flex: 1, justifyContent: 'center' }}><FaSave /> Kaydet</Btn>
              <Btn onClick={() => setModal(null)} color="#6b7280" outline style={{ flex: 1, justifyContent: 'center' }}>İptal</Btn>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── Sohbet sekmesi (birebir mesajlaşma) ───
function ChatTab({ user }) {
  const [conversations, setConversations] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [showDirectory, setShowDirectory] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const activeUserRef = useRef(null);
  useEffect(() => { activeUserRef.current = activeUser; }, [activeUser]);

  const loadConversations = async () => {
    try { setConversations(await api.messages.getConversations()); }
    catch (e) { alert(e.message); }
  };

  const loadDirectory = async () => {
    try { setDirectory(await api.messages.getDirectory()); }
    catch (e) { alert(e.message); }
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (msg) => {
      const otherPartyId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
      if (activeUserRef.current && otherPartyId === activeUserRef.current.id) {
        setThread((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      loadConversations();
    };
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const openThread = async (otherUser) => {
    setActiveUser(otherUser);
    setShowDirectory(false);
    setLoadingThread(true);
    try {
      const msgs = await api.messages.getThread(otherUser.id);
      setThread(msgs);
      loadConversations();
    } catch (e) { alert(e.message); }
    setLoadingThread(false);
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeUser || sending) return;
    setSending(true);
    try {
      const msg = await api.messages.send(activeUser.id, content);
      setThread((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft('');
      loadConversations();
    } catch (e) { alert(e.message); }
    setSending(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 560 }}>
      <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><FaComments /> Sohbetler</h4>
          <Btn size="sm" outline onClick={() => { setShowDirectory(!showDirectory); if (!showDirectory) loadDirectory(); }}>
            {showDirectory ? 'Geri' : '+ Yeni'}
          </Btn>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {showDirectory ? (
            directory.length === 0 ? (
              <p style={{ padding: 16, color: '#9ca3af', fontSize: 13 }}>Sohbet başlatılabilecek kimse yok.</p>
            ) : directory.map((u) => (
              <div key={u.id} onClick={() => openThread(u)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                <Avatar src={resolveAvatarUrl(u.avatarUrl)} name={u.fullName} size={30} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    {u.role === 'admin' ? 'Yönetici' : u.role === 'trainer' ? 'Antrenör' : 'Üye'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            conversations.length === 0 ? (
              <p style={{ padding: 16, color: '#9ca3af', fontSize: 13 }}>Henüz sohbetin yok. "+ Yeni" ile başlat.</p>
            ) : conversations.map((c) => (
              <div key={c.user.id} onClick={() => openThread(c.user)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: activeUser?.id === c.user.id ? '#faf5ff' : 'transparent'
                }}>
                <Avatar src={resolveAvatarUrl(c.user.avatarUrl)} name={c.user.fullName} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.user.fullName}</span>
                    {c.unreadCount > 0 && <Badge label={c.unreadCount} color="#e94560" />}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.lastMessage.senderId === user.id ? 'Sen: ' : ''}{c.lastMessage.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeUser ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 10 }}>
            <FaComments size={40} />
            <p style={{ margin: 0 }}>Sohbet etmek için soldan bir kullanıcı seç.</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar src={resolveAvatarUrl(activeUser.avatarUrl)} name={activeUser.fullName} size={30} /> {activeUser.fullName}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loadingThread ? (
                <p style={{ color: '#9ca3af', textAlign: 'center' }}>Yükleniyor...</p>
              ) : thread.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center' }}>İlk mesajı sen gönder!</p>
              ) : thread.map((m) => (
                <div key={m.id} style={{
                  alignSelf: m.senderId === user.id ? 'flex-end' : 'flex-start',
                  background: m.senderId === user.id ? BRAND.primary : '#f3f4f6',
                  color: m.senderId === user.id ? '#fff' : '#111827',
                  borderRadius: 14, padding: '8px 14px', maxWidth: '70%', fontSize: 14, wordBreak: 'break-word',
                }}>
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Mesaj yaz..."
                style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 14px', fontSize: 14, outline: 'none' }}
              />
              <Btn onClick={sendMessage}><FaPaperPlane /></Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}