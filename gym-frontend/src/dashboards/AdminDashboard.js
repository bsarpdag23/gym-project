import React, { useState, useEffect } from 'react';
import { BRAND, Btn, Card, Badge, Input, Select, Modal, Logo } from '../components/ui';
import api from '../api';

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [myMembers, setMyMembers] = useState([]);
  const [plans, setPlans]       = useState([]);
  const [enrollments, setEnr]   = useState([]);
  const [exercises, setExs]     = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [stats, setStats] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    try {
      if (tab === 'users') {
        setUsers(await api.users.getAll());
        if (user.role === 'admin') setTrainers(await api.users.getTrainers());
      }
      if (tab === 'mymembers') setMyMembers(await api.users.getMyMembers());
      if (tab === 'plans')       setPlans(await api.plans.getAll());
      if (tab === 'enrollments') setEnr(await api.enrollments.getAll());
      if (tab === 'exercises')   setExs(await api.exercises.getAll());
      if (tab === 'checkin') setCheckIns(await api.checkIns.getAll());
      if (tab === 'dashboard') setStats(await api.dashboard.getStats());
      if (tab === 'programs') {
        const [p, e] = await Promise.all([api.programs.getAll(), api.exercises.getAll()]);
        setPrograms(p); setExs(e);
      }
    } catch (e) { alert(e.message); }
  };
  useEffect(() => { load(); }, [tab]);

  const openAdd = (type) => {
    const defaults = {
      exercise: { category: 'cardio', sets: 3, reps: 12 },
      plan:     { durationMonths: 1, price: 0 },
      program:  { difficulty: 'beginner', weeksCount: 4 },
    };
    setForm(defaults[type] || {});
    setModal({ type, item: null });
  };
  const openEdit = (type, item) => { setForm(item); setModal({ type, item }); };

  const save = async () => {
    try {
      const t = modal.type;
      if (t === 'plan') {
        const payload = { ...form, durationMonths: +form.durationMonths, price: +form.price };
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
      if (type === 'plan')     await api.plans.remove(id);
      if (type === 'exercise') await api.exercises.remove(id);
      if (type === 'program')  await api.programs.remove(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const addEx  = async (pid, eid) => { try { await api.programs.addExercise(pid, eid);  load(); } catch(e){ alert(e.message); } };
  const dropEx = async (pid, eid) => { try { await api.programs.dropExercise(pid, eid); load(); } catch(e){ alert(e.message); } };

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
    { id:'dashboard',   label:'📊 Dashboard',           roles:['admin'] },
    { id:'users',       label:'🧑‍🤝‍🧑 Üyeler',          roles:['admin','trainer'] },
    { id:'mymembers',   label:'💪 PT Üyelerim',         roles:['trainer'] },
    { id:'checkin',     label:'🚪 Giriş Kayıtları',      roles:['admin','trainer'] },
    { id:'plans',       label:'📦 Üyelik Paketleri',    roles:['admin'] },
    { id:'enrollments', label:'👥 Üyelikler',           roles:['admin','trainer'] },
    { id:'exercises',   label:'🏋️ Egzersizler',         roles:['admin','trainer'] },
    { id:'programs',    label:'📋 Programlar',           roles:['admin','trainer'] },
  ];
  const TABS = ALL_TABS.filter(t => t.roles.includes(user.role));
  const color = { users:'#e94560', plans:'#3b82f6', enrollments:'#10b981', exercises:'#f59e0b', programs:'#8b5cf6', dashboard:'#8b5cf6', mymembers:'#8b5cf6', checkin:'#10b981' };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
      <div style={{ background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`, padding:'14px 28px',
        display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 10px rgba(233,69,96,.3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Logo light />
          <Badge label={user.role === 'admin' ? 'Admin' : 'Trainer'} color="#fff" />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14, color:'#fff' }}>
          <span style={{ fontSize:14 }}>👤 {user.fullName}</span>
          <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'9px 20px', borderRadius:10, border:`2px solid ${tab===t.id?(color[t.id]||BRAND.primary):'#e5e7eb'}`,
              background: tab===t.id ? (color[t.id]||BRAND.primary) : '#fff',
              color: tab===t.id ? '#fff' : '#374151',
              fontWeight:600, fontSize:14, cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'users' && (
          <div>
            <h2 style={{ margin:'0 0 16px' }}>Kayıtlı Kullanıcılar ({users.length})</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {users.length === 0 && (
                <Card style={{ textAlign:'center', padding:40 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🧑‍🤝‍🧑</div>
                  <p style={{ color:'#6b7280', margin:0 }}>Henüz kayıtlı kullanıcı yok.</p>
                </Card>
              )}
              
              {users.map(u => (
                <Card key={u.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600 }}>{u.fullName}</div>
                    <div style={{ color:'#6b7280', fontSize:13 }}>{u.email}</div>
                    {u.phone && <div style={{ color:'#9ca3af', fontSize:12 }}>{u.phone}</div>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {user.role === 'admin' ? (
                      <div style={{ minWidth:130 }}>
                        <Select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          options={[
                            { value:'member',  label:'Üye' },
                            { value:'trainer', label:'Trainer' },
                            { value:'admin',   label:'Admin' },
                          ]} />
                      </div>
                    ) : (
                      <Badge
                        label={u.role === 'admin' ? 'Admin' : u.role === 'trainer' ? 'Trainer' : 'Üye'}
                        color={u.role === 'admin' ? '#e94560' : u.role === 'trainer' ? '#8b5cf6' : '#10b981'} />
                    )}

                    {user.role === 'admin' && u.role === 'member' && (
                      u.hasActivePT ? (
                        <div style={{ minWidth:150 }}>
                          <Select
                            value={u.assignedTrainerId || ''}
                            onChange={(e) => assignTrainer(u.id, e.target.value)}
                            options={[
                              { value:'', label:'— Trainer seç —' },
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
        )}

        {tab === 'plans' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ margin:0 }}>Üyelik Paketleri</h2>
              <Btn onClick={() => openAdd('plan')}>+ Yeni Paket</Btn>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {plans.length === 0 && (
                <Card style={{ textAlign:'center', padding:40, gridColumn:'1 / -1' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
                  <p style={{ color:'#6b7280', margin:0 }}>Henüz üyelik paketi yok. "+ Yeni Paket" ile ekleyin.</p>
                </Card>
              )}
              
              {plans.map(p => (
                <Card key={p.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <h3 style={{ margin:0, fontSize:16 }}>{p.name}</h3>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn size="sm" color="#6b7280" outline onClick={() => openEdit('plan', p)}>✏️</Btn>
                      <Btn size="sm" color={BRAND.primary} outline onClick={() => del('plan', p.id)}>🗑️</Btn>
                    </div>
                  </div>
                  <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 12px' }}>{p.description}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Badge label={`${p.durationMonths} Ay`} color="#3b82f6" />
                    <span style={{ fontSize:22, fontWeight:700, color:BRAND.primary }}>{p.price} ₺</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'enrollments' && (
          <div>
            <h2 style={{ margin:'0 0 16px' }}>Tüm Üyelikler</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {enrollments.length === 0 && (
                <Card style={{ textAlign:'center', padding:40 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>👥</div>
                  <p style={{ color:'#6b7280', margin:0 }}>Henüz üyelik satın alınmamış.</p>
                </Card>
              )}
              
              {enrollments.map(e => (
                <Card key={e.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600 }}>{e.member?.fullName}</div>
                    <div style={{ color:'#6b7280', fontSize:13 }}>{e.plan?.name}</div>
                    <div style={{ color:'#9ca3af', fontSize:12 }}>
                      {new Date(e.startDate).toLocaleDateString('tr')} → {new Date(e.endDate).toLocaleDateString('tr')}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:700, color:'#10b981' }}>{e.amountPaid} ₺</div>
                    <Badge label={e.status === 'active' ? 'Aktif' : 'Pasif'}
                      color={e.status === 'active' ? '#10b981' : '#6b7280'} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'exercises' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ margin:0 }}>Egzersizler</h2>
              <Btn onClick={() => openAdd('exercise')} color="#f59e0b">+ Yeni Egzersiz</Btn>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
              {exercises.length === 0 && (
                <Card style={{ textAlign:'center', padding:40, gridColumn:'1 / -1' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🏋️</div>
                  <p style={{ color:'#6b7280', margin:0 }}>Henüz egzersiz yok. "+ Yeni Egzersiz" ile ekleyin.</p>
                </Card>
              )}
              
              {exercises.map(e => (
                <Card key={e.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ fontWeight:600 }}>{e.name}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn size="sm" color="#6b7280" outline onClick={() => openEdit('exercise', e)}>✏️</Btn>
                      <Btn size="sm" color={BRAND.primary} outline onClick={() => del('exercise', e.id)}>🗑️</Btn>
                    </div>
                  </div>
                  <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 10px' }}>{e.description}</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <Badge label={e.category}  color="#f59e0b" />
                    {e.equipment && <Badge label={e.equipment} color="#6b7280" />}
                    <Badge label={`${e.sets}×${e.reps}`} color="#3b82f6" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'programs' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ margin:0 }}>Antrenman Programları</h2>
              <Btn onClick={() => openAdd('program')} color="#8b5cf6">+ Yeni Program</Btn>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {programs.length === 0 && (
                <Card style={{ textAlign:'center', padding:40 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
                  <p style={{ color:'#6b7280', margin:0 }}>Henüz antrenman programı yok. "+ Yeni Program" ile ekleyin.</p>
                </Card>
              )}
              
              {programs.map(p => (
                <Card key={p.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <h3 style={{ margin:'0 0 6px', fontSize:17 }}>{p.name}</h3>
                      <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 10px' }}>{p.description}</p>
                      <div style={{ display:'flex', gap:8 }}>
                        <Badge label={p.difficulty} color="#8b5cf6" />
                        <Badge label={`${p.weeksCount} Hafta`} color="#10b981" />
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn size="sm" color="#6b7280" outline onClick={() => openEdit('program', p)}>✏️</Btn>
                      <Btn size="sm" color={BRAND.primary} outline onClick={() => del('program', p.id)}>🗑️</Btn>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
                    {(p.exercises || []).map(e => (
                      <span key={e.id} style={{ background:BRAND.primary+'15', color:BRAND.primary,
                        border:`1px solid ${BRAND.primary}33`, borderRadius:20, padding:'3px 10px', fontSize:12,
                        display:'flex', alignItems:'center', gap:4 }}>
                        {e.name}
                        <button onClick={() => dropEx(p.id, e.id)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:BRAND.primary, fontWeight:700, fontSize:14, lineHeight:1, padding:0 }}>×</button>
                      </span>
                    ))}
                    <select
                      defaultValue=""
                      onChange={ev => { if (ev.target.value) { addEx(p.id, +ev.target.value); ev.target.value = ''; } }}
                      style={{ border:'1.5px dashed #8b5cf6', background:'#8b5cf608', color:'#8b5cf6',
                        borderRadius:20, padding:'3px 10px', fontSize:12, cursor:'pointer', outline:'none' }}>
                      <option value="">+ Egzersiz Ekle</option>
                      {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'mymembers' && (
          <div>
            <h2 style={{ margin:'0 0 16px' }}>PT Üyelerim ({myMembers.length})</h2>
            {myMembers.length === 0 && (
              <Card style={{ textAlign:'center', padding:40 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>💪</div>
                <p style={{ color:'#6b7280', margin:0 }}>Henüz size atanmış bir üye yok.</p>
              </Card>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {myMembers.map(m => (
                <Card key={m.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <h3 style={{ margin:'0 0 4px', fontSize:17 }}>{m.fullName}</h3>
                      <div style={{ color:'#6b7280', fontSize:13 }}>{m.email}</div>
                      {m.phone && <div style={{ color:'#9ca3af', fontSize:12 }}>{m.phone}</div>}
                    </div>
                    {m.activeProgram && (
                      <Badge label={
                        m.activeProgram.goal === 'gain' ? 'Kilo Alma' :
                        m.activeProgram.goal === 'lose' ? 'Kilo Verme' : 'Koruma'
                      } color="#8b5cf6" />
                    )}
                  </div>

                  {m.activeProgram ? (
                    <div style={{ background:'#faf5ff', borderRadius:10, padding:14 }}>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                        <Badge label={`${m.activeProgram.startWeightKg} → ${m.activeProgram.targetWeightKg} kg`} color="#3b82f6" />
                        <Badge label={`${m.activeProgram.durationWeeks} hafta`} color="#10b981" />
                        <Badge label={`${m.activeProgram.dailyCalories} kcal`} color="#e94560" />
                      </div>
                      <div style={{ fontSize:13, color:'#6b7280', marginBottom:10 }}>
                        Protein {m.activeProgram.proteinG}g · Karbonhidrat {m.activeProgram.carbsG}g · Yağ {m.activeProgram.fatG}g
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {(m.activeProgram.workoutPlan || []).map(day => (
                          <div key={day.day} style={{ fontSize:13 }}>
                            <span style={{ fontWeight:600 }}>Gün {day.day} — {day.focus}:</span>{' '}
                            <span style={{ color:'#6b7280' }}>
                              {(day.exercises || []).map(e => e.name).join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color:'#9ca3af', fontSize:13, margin:0 }}>Bu üye henüz bir program oluşturmamış.</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'checkin' && (
          <div>
            <h2 style={{ margin:'0 0 16px' }}>🚪 Üye Girişi (Check-in)</h2>

            <Card style={{ marginBottom:20 }}>
              <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 12px' }}>
                Üyenin QR kodunu okutun veya token'ı girin.
              </p>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ flex:1 }}>
                  <Input
                    value={scanToken}
                    onChange={(e) => setScanToken(e.target.value)}
                    placeholder="QR token..."
                  />
                </div>
                <Btn onClick={doScan} style={{ height:44 }}>Giriş Yap</Btn>
              </div>

              {scanResult && (
                <div style={{
                  marginTop:16, padding:'14px 18px', borderRadius:10,
                  background: scanResult.ok ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${scanResult.ok ? '#86efac' : '#fca5a5'}`,
                }}>
                  {scanResult.ok ? (
                    <div>
                      <div style={{ fontSize:16, fontWeight:700, color:'#16a34a' }}>
                        ✅ {scanResult.data.message}
                      </div>
                      <div style={{ fontSize:13, color:'#6b7280', marginTop:6 }}>
                        Paket: {scanResult.data.plan || '—'} · Geçerlilik: {scanResult.data.validUntil}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize:15, fontWeight:600, color:'#dc2626' }}>
                      ❌ {scanResult.message}
                    </div>
                  )}
                </div>
              )}
            </Card>

            <h3 style={{ margin:'0 0 12px' }}>Son Girişler ({checkIns.length})</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {checkIns.length === 0 && (
                <Card style={{ textAlign:'center', padding:30, color:'#9ca3af' }}>
                  Henüz giriş kaydı yok.
                </Card>
              )}
              {checkIns.map(c => (
                <Card key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontWeight:600 }}>{c.member?.fullName || 'Bilinmeyen üye'}</div>
                  <div style={{ color:'#9ca3af', fontSize:13 }}>
                    {new Date(c.checkInTime).toLocaleString('tr')}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'dashboard' && (
          <div>
            <h2 style={{ margin:'0 0 20px' }}>📊 Genel Bakış</h2>

            {!stats ? (
              <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
                  {[
                    { label:'Toplam Üye',      value: stats.totalMembers,       icon:'👥', color:'#3b82f6' },
                    { label:'Aktif Üyelik',    value: stats.activeEnrollments,  icon:'🎫', color:'#10b981' },
                    { label:'Toplam Gelir',    value: `${stats.totalRevenue.toLocaleString('tr')} ₺`, icon:'💰', color:'#e94560' },
                    { label:'Bugünkü Giriş',   value: stats.todayCheckIns,      icon:'🚪', color:'#8b5cf6' },
                  ].map(k => (
                    <Card key={k.label} style={{ borderLeft:`4px solid ${k.color}` }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>{k.icon}</div>
                      <div style={{ fontSize:30, fontWeight:800, color:k.color }}>{k.value}</div>
                      <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{k.label}</div>
                    </Card>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
                  <Card>
                    <h3 style={{ margin:'0 0 14px', fontSize:16 }}>🏆 En Popüler Paketler</h3>
                    {stats.popularPlans.length === 0 ? (
                      <p style={{ color:'#9ca3af', fontSize:13 }}>Henüz satış yok.</p>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {stats.popularPlans.map((p, i) => (
                          <div key={p.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <span style={{ fontWeight:700, color:'#9ca3af' }}>{i + 1}.</span>
                              <span style={{ fontSize:14 }}>{p.name || 'Bilinmeyen'}</span>
                            </div>
                            <Badge label={`${p.count} satış`} color="#3b82f6" />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card>
                    <h3 style={{ margin:'0 0 14px', fontSize:16 }}>👤 Kullanıcı Dağılımı</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {stats.roleDistribution.map(r => (
                        <div key={r.role} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:14 }}>
                            {r.role === 'admin' ? '⚙️ Admin' : r.role === 'trainer' ? '🏋️ Trainer' : '🏃 Üye'}
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
        )}
      </div>

      {modal && (
        <Modal title={`${modal.item ? 'Düzenle' : 'Yeni Ekle'} — ${
          modal.type==='plan'?'Üyelik Paketi':modal.type==='exercise'?'Egzersiz':'Program'}`}
          onClose={() => setModal(null)}>

          {modal.type === 'plan' && <>
            <Input label="Paket Adı"   value={form.name||''}            onChange={set('name')} />
            <Input label="Süre (Ay)"   value={form.durationMonths||''} onChange={set('durationMonths')} type="number" />
            <Input label="Fiyat (₺)"   value={form.price||''}          onChange={set('price')} type="number" />
            <Input label="Açıklama"    value={form.description||''}    onChange={set('description')} />
            <label style={{ display:'flex', alignItems:'center', gap:10, marginTop:8, cursor:'pointer',
              padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:9, background:'#faf5ff' }}>
              <input
                type="checkbox"
                checked={!!form.includesPersonalTraining}
                onChange={(e) => setForm({ ...form, includesPersonalTraining: e.target.checked })}
                style={{ width:18, height:18, cursor:'pointer', accentColor:'#8b5cf6' }}
              />
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>🏋️ Personal Training (PT) dahil</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>Bu paketi alan üyelere trainer atanabilir</div>
              </div>
            </label>
          </>}

          {modal.type === 'exercise' && <>
            <Input label="Egzersiz Adı" value={form.name||''}        onChange={set('name')} />
            <Input label="Açıklama"     value={form.description||''} onChange={set('description')} />
            <Select label="Kategori" value={form.category||'cardio'} onChange={set('category')}
              options={[
                { value:'cardio', label:'Cardio' },
                { value:'strength', label:'Strength' },
                { value:'flexibility', label:'Flexibility' },
                { value:'balance', label:'Balance' },
              ]} />
            <Input label="Ekipman"  value={form.equipment||''} onChange={set('equipment')} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Input label="Set"    value={form.sets||3}  onChange={set('sets')}  type="number" />
              <Input label="Tekrar" value={form.reps||12} onChange={set('reps')}  type="number" />
            </div>
          </>}

          {modal.type === 'program' && <>
            <Input label="Program Adı" value={form.name||''}        onChange={set('name')} />
            <Input label="Açıklama"    value={form.description||''} onChange={set('description')} />
            <Select label="Zorluk" value={form.difficulty||'beginner'} onChange={set('difficulty')}
              options={[
                { value:'beginner', label:'Başlangıç' },
                { value:'intermediate', label:'Orta' },
                { value:'advanced', label:'İleri' },
              ]} />
            <Input label="Hafta Sayısı" value={form.weeksCount||4} onChange={set('weeksCount')} type="number" />
          </>}

          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <Btn onClick={save} style={{ flex:1, justifyContent:'center' }}>💾 Kaydet</Btn>
            <Btn onClick={() => setModal(null)} color="#6b7280" outline style={{ flex:1, justifyContent:'center' }}>İptal</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}