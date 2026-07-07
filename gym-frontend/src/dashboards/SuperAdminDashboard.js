import React, { useState, useEffect } from 'react';
import { BRAND, Btn, Card, Badge, Input, Modal, Logo } from '../components/ui';
import api from '../api';

export default function SuperAdminDashboard({ user, onLogout }) {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGym, setSelectedGym] = useState(null);
  const [detail, setDetail] = useState(null);
  const [gymUsers, setGymUsers] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name:'', address:'', phone:'',
    ownerName:'', ownerEmail:'', ownerPassword:'',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try { setGyms(await api.gyms.getAll()); }
    catch (e) { alert(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openGym = async (gymId) => {
    setSelectedGym(gymId);
    setDetailLoading(true);
    try {
      const [d, u] = await Promise.all([
        api.gyms.getDetail(gymId),
        api.gyms.getUsers(gymId),
      ]);
      setDetail(d);
      setGymUsers(u);
    } catch (e) {
      alert(e.message);
    }
    setDetailLoading(false);
  };

  const backToList = () => {
    setSelectedGym(null);
    setDetail(null);
    setGymUsers([]);
  };

  const openAdd = () => {
    setForm({ name:'', address:'', phone:'', ownerName:'', ownerEmail:'', ownerPassword:'' });
    setErr('');
    setModal(true);
  };

  const save = async () => {
    setErr(''); setSaving(true);
    try {
      await api.gyms.create(form);
      setModal(false);
      load();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  // ─── DETAY GÖRÜNÜMÜ ───
  if (selectedGym) {
    return (
      <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
        <div style={{ background:`linear-gradient(135deg,${BRAND.dark},${BRAND.purple})`, padding:'14px 28px',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Logo light />
            <Badge label="⚡ Süper Admin" color="#fff" />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, color:'#fff' }}>
            <span style={{ fontSize:14 }}>👑 {user.fullName}</span>
            <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
          <button onClick={backToList} style={{ background:'none', border:'none', color:BRAND.purple,
            cursor:'pointer', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
            ← Salonlara dön
          </button>

          {detailLoading ? (
            <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>
          ) : detail ? (
            <>
              <div style={{ marginBottom:24 }}>
                <h2 style={{ margin:'0 0 4px' }}>🏢 {detail.gym.name}</h2>
                <p style={{ color:'#6b7280', fontSize:14, margin:0 }}>
                  {detail.gym.address || 'Adres belirtilmemiş'} · Destek görünümü
                </p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
                {[
                  { label:'Toplam Üye',    value: detail.stats.totalMembers,      icon:'👥', color:'#3b82f6' },
                  { label:'Aktif Üyelik',  value: detail.stats.activeEnrollments, icon:'🎫', color:'#10b981' },
                  { label:'Toplam Gelir',  value: `${detail.stats.totalRevenue.toLocaleString('tr')} ₺`, icon:'💰', color:'#e94560' },
                  { label:'Bugünkü Giriş', value: detail.stats.todayCheckIns,     icon:'🚪', color:'#8b5cf6' },
                ].map(k => (
                  <Card key={k.label} style={{ borderLeft:`4px solid ${k.color}` }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>{k.icon}</div>
                    <div style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{k.label}</div>
                  </Card>
                ))}
              </div>

              <h3 style={{ margin:'0 0 14px' }}>👤 Salon Kullanıcıları ({gymUsers.length})</h3>
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
  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
      <div style={{ background:`linear-gradient(135deg,${BRAND.dark},${BRAND.purple})`, padding:'14px 28px',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Logo light />
          <Badge label="⚡ Süper Admin" color="#fff" />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14, color:'#fff' }}>
          <span style={{ fontSize:14 }}>👑 {user.fullName}</span>
          <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ margin:'0 0 4px' }}>🏢 Salonlar ({gyms.length})</h2>
            <p style={{ color:'#6b7280', fontSize:14, margin:0 }}>Platformdaki tüm spor salonlarını yönetin.</p>
          </div>
          <Btn onClick={openAdd} color={BRAND.purple}>+ Yeni Salon</Btn>
        </div>

        {loading ? (
          <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>
        ) : gyms.length === 0 ? (
          <Card style={{ textAlign:'center', padding:50 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏢</div>
            <p style={{ color:'#6b7280', margin:0 }}>Henüz salon yok. İlk salonu oluşturun.</p>
          </Card>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {gyms.map(g => (
              <div key={g.id} onClick={() => openGym(g.id)}>
                <Card style={{ cursor:'pointer', transition:'transform .12s, box-shadow .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)'; }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <h3 style={{ margin:0, fontSize:17 }}>{g.name}</h3>
                    <Badge label={g.isActive ? 'Aktif' : 'Pasif'} color={g.isActive ? '#10b981' : '#6b7280'} />
                  </div>
                  {g.address && <div style={{ color:'#6b7280', fontSize:13, marginBottom:4 }}>📍 {g.address}</div>}
                  {g.phone && <div style={{ color:'#9ca3af', fontSize:13, marginBottom:4 }}>📞 {g.phone}</div>}
                  <div style={{ color:'#9ca3af', fontSize:12, marginTop:8, borderTop:'1px solid #f0f0f0', paddingTop:8 }}>
                    Oluşturuldu: {new Date(g.createdAt).toLocaleDateString('tr')}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title="🏢 Yeni Salon Oluştur" onClose={() => setModal(false)}>
          {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
            borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

          <div style={{ fontSize:13, fontWeight:700, color:'#6b7280', marginBottom:8 }}>SALON BİLGİLERİ</div>
          <Input label="Salon Adı" value={form.name} onChange={set('name')} placeholder="FitLife Kadıköy" />
          <Input label="Adres" value={form.address} onChange={set('address')} placeholder="Kadıköy, İstanbul" />
          <Input label="Telefon" value={form.phone} onChange={set('phone')} placeholder="0216 000 00 00" />

          <div style={{ fontSize:13, fontWeight:700, color:'#6b7280', margin:'16px 0 8px' }}>SALON SAHİBİ (ADMIN)</div>
          <Input label="Ad Soyad" value={form.ownerName} onChange={set('ownerName')} placeholder="Ahmet Yılmaz" />
          <Input label="Email" value={form.ownerEmail} onChange={set('ownerEmail')} type="email" placeholder="ahmet@salon.com" />
          <Input label="Şifre" value={form.ownerPassword} onChange={set('ownerPassword')} type="password" placeholder="En az 6 karakter" />

          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <Btn onClick={save} color={BRAND.purple} style={{ flex:1, justifyContent:'center' }}>
              {saving ? 'Oluşturuluyor...' : '💾 Oluştur'}
            </Btn>
            <Btn onClick={() => setModal(false)} color="#6b7280" outline style={{ flex:1, justifyContent:'center' }}>İptal</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}