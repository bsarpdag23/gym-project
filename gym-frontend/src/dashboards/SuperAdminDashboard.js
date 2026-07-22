import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  FaBolt, FaCrown, FaBuilding, FaUsers, FaTicketAlt, FaMoneyBillWave,
  FaDoorOpen, FaUser, FaMapMarkerAlt, FaPhone, FaSave, FaEdit, FaTrash,
} from 'react-icons/fa';
import { BRAND, Btn, Card, Badge, Input, Modal, Logo } from '../components/ui';
import api from '../api';

function Header({ user, onLogout }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${BRAND.dark},${BRAND.purple})`, padding:'14px 28px',
      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <Logo light />
        <Badge label={<><FaBolt/> Süper Admin</>} color="#fff" />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14, color:'#fff' }}>
        <span style={{ fontSize:14, display:'inline-flex', alignItems:'center', gap:6 }}><FaCrown/> {user.fullName}</span>
        <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
      </div>
    </div>
  );
}

// ─── DETAY GÖRÜNÜMÜ ───
function GymDetailView({ user, onLogout }) {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [gymUsers, setGymUsers] = useState([]);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setDetailLoading(true);
      try {
        const [d, u] = await Promise.all([
          api.gyms.getDetail(gymId),
          api.gyms.getUsers(gymId),
        ]);
        setDetail(d);
        setGymUsers(u);
      } catch (e) { alert(e.message); }
      setDetailLoading(false);
    })();
  }, [gymId]);

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
        <button onClick={() => navigate('/super-admin')} style={{ background:'none', border:'none', color:BRAND.purple,
          cursor:'pointer', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
          ← Salonlara dön
        </button>

        {detailLoading ? (
          <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>
        ) : detail ? (
          <>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}><FaBuilding/> {detail.gym.name}</h2>
              <p style={{ color:'#6b7280', fontSize:14, margin:0 }}>
                {detail.gym.address || 'Adres belirtilmemiş'} · Destek görünümü
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
              {[
                { label:'Toplam Üye',    value: detail.stats.totalMembers,      icon:<FaUsers/>, color:'#3b82f6' },
                { label:'Aktif Üyelik',  value: detail.stats.activeEnrollments, icon:<FaTicketAlt/>, color:'#10b981' },
                { label:'Toplam Gelir',  value: `${detail.stats.totalRevenue.toLocaleString('tr')} ₺`, icon:<FaMoneyBillWave/>, color:'#e94560' },
                { label:'Bugünkü Giriş', value: detail.stats.todayCheckIns,     icon:<FaDoorOpen/>, color:'#8b5cf6' },
              ].map(k => (
                <Card key={k.label} style={{ borderLeft:`4px solid ${k.color}` }}>
                  <div style={{ fontSize:24, marginBottom:6, color:k.color }}>{k.icon}</div>
                  <div style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{k.label}</div>
                </Card>
              ))}
            </div>

            <h3 style={{ margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}><FaUser/> Salon Kullanıcıları ({gymUsers.length})</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {gymUsers.length === 0 ? (
                <Card style={{ textAlign:'center', padding:30, color:'#9ca3af' }}>
                  Bu salonda henüz kullanıcı yok.
                </Card>
              ) : gymUsers.map(u => (
                <Card key={u.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600 }}>{u.fullName}</div>
                    <div style={{ color:'#6b7280', fontSize:13 }}>{u.email}</div>
                    {u.phone && <div style={{ color:'#9ca3af', fontSize:12 }}>{u.phone}</div>}
                  </div>
                  <Badge
                    label={u.role === 'admin' ? 'Salon Sahibi' : u.role === 'trainer' ? 'Trainer' : 'Üye'}
                    color={u.role === 'admin' ? '#e94560' : u.role === 'trainer' ? '#8b5cf6' : '#10b981'} />
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Salon bilgisi yüklenemedi.</Card>
        )}
      </div>
    </div>
  );
}

// ─── LİSTE GÖRÜNÜMÜ ───
function GymListView({ user, onLogout }) {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'add', 'edit', null
  const [editingGym, setEditingGym] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [form, setForm] = useState({
    name:'', address:'', phone:'',
    ownerName:'', ownerEmail:'', ownerPassword:'',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      const [gymData, statsData] = await Promise.all([
        api.gyms.getAll(),
        api.gyms.getGlobalStats(),
      ]);
      setGyms(gymData);
      setGlobalStats(statsData);
    }
    catch (e) { alert(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ name:'', address:'', phone:'', ownerName:'', ownerEmail:'', ownerPassword:'' });
    setEditingGym(null);
    setErr('');
    setModalType('add');
  };

  const openEdit = (gym) => {
    setForm({
      name: gym.name,
      address: gym.address || '',
      phone: gym.phone || '',
      ownerName: '', ownerEmail: '', ownerPassword: ''
    });
    setEditingGym(gym);
    setErr('');
    setModalType('edit');
  };

  const save = async () => {
    setErr(''); setSaving(true);
    try {
      if (modalType === 'add') {
        await api.gyms.create(form);
      } else if (modalType === 'edit' && editingGym) {
        await api.gyms.update(editingGym.id, {
          name: form.name,
          address: form.address,
          phone: form.phone,
        });
      }
      setModalType(null);
      setEditingGym(null);
      load();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const toggleStatus = async (gym) => {
    try {
      await api.gyms.update(gym.id, { isActive: !gym.isActive });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const confirmDelete = async (id) => {
    if (!window.confirm('Bu salonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve salona bağlı tüm üyelik ilişkileri temizlenir.')) return;
    try {
      await api.gyms.remove(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
      <Header user={user} onLogout={onLogout} />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
        
        {/* Global Platform Stats Dashboard */}
        {globalStats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
            {[
              { label:'Toplam Salon',    value: globalStats.totalGyms,          icon:<FaBuilding/>, color: BRAND.purple },
              { label:'Toplam Üye',      value: globalStats.totalMembers,       icon:<FaUsers/>, color:'#3b82f6' },
              { label:'Aktif Üyelik',    value: globalStats.activeEnrollments,  icon:<FaTicketAlt/>, color:'#10b981' },
              { label:'Toplam Gelir',     value: `${globalStats.totalRevenue.toLocaleString('tr')} ₺`, icon:<FaMoneyBillWave/>, color:'#e94560' },
              { label:'Bugünkü Giriş',   value: globalStats.todayCheckIns,      icon:<FaDoorOpen/>, color:'#f59e0b' },
            ].map(k => (
              <Card key={k.label} style={{ borderLeft:`4px solid ${k.color}`, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ fontSize:20, marginBottom:6, color:k.color }}>{k.icon}</div>
                <div style={{ fontSize:24, fontWeight:800, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{k.label}</div>
              </Card>
            ))}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}><FaBuilding/> Salonlar ({gyms.length})</h2>
            <p style={{ color:'#6b7280', fontSize:14, margin:0 }}>Platformdaki tüm spor salonlarını yönetin.</p>
          </div>
          <Btn onClick={openAdd} color={BRAND.purple}>+ Yeni Salon</Btn>
        </div>

        {loading ? (
          <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>
        ) : gyms.length === 0 ? (
          <Card style={{ textAlign:'center', padding:50 }}>
            <div style={{ fontSize:48, marginBottom:12, display:'flex', justifyContent:'center' }}><FaBuilding/></div>
            <p style={{ color:'#6b7280', margin:0 }}>Henüz salon yok. İlk salonu oluşturun.</p>
          </Card>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {gyms.map(g => (
              <div key={g.id} onClick={() => navigate(`/super-admin/gyms/${g.id}`)}>
                <Card style={{ cursor:'pointer', transition:'transform .12s, box-shadow .12s', opacity: g.isActive ? 1 : 0.75 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)'; }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <h3 style={{ margin:0, fontSize:17 }}>{g.name}</h3>
                    <Badge label={g.isActive ? 'Aktif' : 'Pasif (Askıda)'} color={g.isActive ? '#10b981' : '#6b7280'} />
                  </div>
                  {g.address && <div style={{ color:'#6b7280', fontSize:13, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}><FaMapMarkerAlt/> {g.address}</div>}
                  {g.phone && <div style={{ color:'#9ca3af', fontSize:13, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}><FaPhone/> {g.phone}</div>}
                  <div style={{ color:'#9ca3af', fontSize:12, marginTop:8, borderTop:'1px solid #f0f0f0', paddingTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span>Oluşturuldu: {new Date(g.createdAt).toLocaleDateString('tr')}</span>
                    <span onClick={(e) => { e.stopPropagation(); window.open(`/gym/${g.id}`, '_blank'); }} style={{ color: BRAND.primary, fontWeight: 700, cursor: 'pointer' }}>
                      Microsite Git →
                    </span>
                  </div>

                  {/* Actions buttons inside the card */}
                  <div style={{ display:'flex', gap:6, marginTop:12, borderTop:'1px solid #f0f0f0', paddingTop:10 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(g)} style={{ flex:1, padding:'7px 8px', fontSize:12, borderRadius:6, border:'1px solid #d1d5db', background:'#fff', color:'#374151', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:4, transition:'background .1s' }}>
                      <FaEdit style={{ fontSize:10 }} /> Düzenle
                    </button>
                    <button onClick={() => toggleStatus(g)} style={{ flex:1, padding:'7px 8px', fontSize:12, borderRadius:6, border:'none', background: g.isActive ? '#6b7280' : '#10b981', color:'#fff', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      {g.isActive ? 'Askıya Al' : 'Etkinleştir'}
                    </button>
                    <button onClick={() => confirmDelete(g.id)} style={{ flex:1, padding:'7px 8px', fontSize:12, borderRadius:6, border:'none', background:'#e94560', color:'#fff', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      <FaTrash style={{ fontSize:10 }} /> Sil
                    </button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalType && (
        <Modal title={<><FaBuilding/> {modalType === 'add' ? 'Yeni Salon Oluştur' : 'Salonu Düzenle'}</>} onClose={() => setModalType(null)}>
          {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
            borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

          <div style={{ fontSize:13, fontWeight:700, color:'#6b7280', marginBottom:8 }}>SALON BİLGİLERİ</div>
          <Input label="Salon Adı" value={form.name} onChange={set('name')} placeholder="FitLife Kadıköy" />
          <Input label="Adres" value={form.address} onChange={set('address')} placeholder="Kadıköy, İstanbul" />
          <Input label="Telefon" value={form.phone} onChange={set('phone')} placeholder="0216 000 00 00" />

          {modalType === 'add' && (
            <>
              <div style={{ fontSize:13, fontWeight:700, color:'#6b7280', margin:'16px 0 8px' }}>SALON SAHİBİ (ADMIN)</div>
              <Input label="Ad Soyad" value={form.ownerName} onChange={set('ownerName')} placeholder="Ahmet Yılmaz" />
              <Input label="Email" value={form.ownerEmail} onChange={set('ownerEmail')} type="email" placeholder="ahmet@salon.com" />
              <Input label="Şifre" value={form.ownerPassword} onChange={set('ownerPassword')} type="password" placeholder="En az 6 karakter" />
            </>
          )}

          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <Btn onClick={save} color={BRAND.purple} style={{ flex:1, justifyContent:'center' }}>
              {saving 
                ? (modalType === 'add' ? 'Oluşturuluyor...' : 'Kaydediliyor...') 
                : <><FaSave/> {modalType === 'add' ? 'Oluştur' : 'Kaydet'}</>}
            </Btn>
            <Btn onClick={() => setModalType(null)} color="#6b7280" outline style={{ flex:1, justifyContent:'center' }}>İptal</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function SuperAdminDashboard({ user, onLogout }) {
  return (
    <Routes>
      <Route index element={<GymListView user={user} onLogout={onLogout} />} />
      <Route path="gyms/:gymId" element={<GymDetailView user={user} onLogout={onLogout} />} />
      <Route path="*" element={<Navigate to="/super-admin" replace />} />
    </Routes>
  );
}
