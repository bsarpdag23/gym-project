// src/App.js  ← mevcut içeriği TAMAMEN sil, bunu yapıştır
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

// ─── Merkezi API yardımcısı ───────────────────────────────────────────────────
const api = {
  async req(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Hata oluştu' }));
      throw new Error(err.message);
    }
    return res.json();
  },
  auth: {
    register: (d)    => api.req('/auth/register', { method:'POST', body: JSON.stringify(d) }),
    login:    (d)    => api.req('/auth/login',    { method:'POST', body: JSON.stringify(d) }),
  },
  users: {
    getAll:       ()          => api.req('/users'),
    updateRole:   (id, role)  => api.req(`/users/${id}/role`, { method:'PATCH', body: JSON.stringify({ role }) }),
    getTrainers:  ()          => api.req('/users/trainers'),
    assignTrainer:(id, trainerId) => api.req(`/users/${id}/trainer`, { method:'PATCH', body: JSON.stringify({ trainerId }) }),
    getMyMembers: () => api.req('/users/my-members'),
  },
  plans: {
    getAll:  ()      => api.req('/membership-plans'),
    create:  (d)     => api.req('/membership-plans',    { method:'POST',   body: JSON.stringify(d) }),
    update:  (id, d) => api.req(`/membership-plans/${id}`, { method:'PATCH',  body: JSON.stringify(d) }),
    remove:  (id)    => api.req(`/membership-plans/${id}`, { method:'DELETE' }),
  },
  enrollments: {
    getAll:  ()   => api.req('/enrollments'),
    getMine: ()   => api.req('/enrollments/my-enrollments'),
    create:  (id) => api.req('/enrollments', { method:'POST', body: JSON.stringify({ planId: id }) }),
  },
  exercises: {
    getAll:  ()      => api.req('/exercises'),
    create:  (d)     => api.req('/exercises',    { method:'POST',   body: JSON.stringify(d) }),
    update:  (id, d) => api.req(`/exercises/${id}`, { method:'PATCH',  body: JSON.stringify(d) }),
    remove:  (id)    => api.req(`/exercises/${id}`, { method:'DELETE' }),
  },
  programs: {
    getAll:       ()          => api.req('/workout-programs'),
    create:       (d)         => api.req('/workout-programs',    { method:'POST',   body: JSON.stringify(d) }),
    update:       (id, d)     => api.req(`/workout-programs/${id}`, { method:'PATCH',  body: JSON.stringify(d) }),
    remove:       (id)        => api.req(`/workout-programs/${id}`, { method:'DELETE' }),
    addExercise:  (pid, eid)  => api.req(`/workout-programs/${pid}/exercises/${eid}`, { method:'POST' }),
    dropExercise: (pid, eid)  => api.req(`/workout-programs/${pid}/exercises/${eid}`, { method:'DELETE' }),
  },
  healthProfile: {
    getMine: ()  => api.req('/health-profile/me'),
    save:    (d) => api.req('/health-profile/me', { method:'PUT', body: JSON.stringify(d) }),
  },
  fitness: {
    preview:  () => api.req('/programs/preview'),
    generate: () => api.req('/programs/generate', { method:'POST' }),
    active:   () => api.req('/programs/active'),
    history:  () => api.req('/programs/history'),
  },
};

const BRAND = { primary:'#e94560', dark:'#0f0f1a', dark2:'#1a1a2e', purple:'#533483' };

// ─── Ortak UI bileşenleri ─────────────────────────────────────────────────────
function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:5, fontSize:13, color:'#6b7280', fontWeight:600 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:9,
          fontSize:14, outline:'none', boxSizing:'border-box', background:'#fff', transition:'border .15s' }}
        onFocus={e => e.target.style.borderColor = BRAND.primary}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:5, fontSize:13, color:'#6b7280', fontWeight:600 }}>{label}</label>}
      <select
        value={value} onChange={onChange}
        style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:9,
          fontSize:14, background:'#fff', boxSizing:'border-box', outline:'none' }}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function Btn({ children, onClick, color = BRAND.primary, outline, size = 'md', style = {} }) {
  const pad = size === 'sm' ? '6px 14px' : size === 'lg' ? '14px 32px' : '10px 22px';
  return (
    <button onClick={onClick} style={{
      padding: pad, fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14, fontWeight: 700, borderRadius: 9, cursor:'pointer',
      background: outline ? 'transparent' : color,
      border: `1.5px solid ${color}`,
      color: outline ? color : '#fff',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
      transition:'transform .12s, box-shadow .12s',
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:'#fff', borderRadius:14, padding:20,
      boxShadow:'0 2px 12px rgba(0,0,0,.07)', border:'1px solid #f0f0f0', ...style }}>
      {children}
    </div>
  );
}

function Badge({ label, color = BRAND.primary }) {
  return (
    <span style={{ background: color + '18', color, border:`1px solid ${color}33`,
      borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:600 }}>
      {label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex',
      alignItems:'center', justifyContent:'center', zIndex:999, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:460,
        boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22,
            cursor:'pointer', color:'#6b7280', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Logo({ light, size = 22 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <div style={{ width:size+14, height:size+14, borderRadius:11,
        background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:size-2, flexShrink:0 }}>⚡</div>
      <span style={{ fontWeight:800, fontSize:size, color: light ? '#fff' : '#111827' }}>
        FitLife <span style={{ color:BRAND.primary }}>Pro</span>
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ANA SAYFA (LANDING / HOME)
// ════════════════════════════════════════════════════════════════════════════
function LandingPage({ goLogin, goRegister }) {
  const features = [
    { icon:'👥', title:'Üye Yönetimi', desc:'Üyelerinizi, paketlerinizi ve üyelik sürelerini tek panelden yönetin.' },
    { icon:'🏋️', title:'Egzersiz Kütüphanesi', desc:'Sınırsız egzersiz ekleyin, kategorilere ayırın, antrenörlerinize özel yetkiler verin.' },
    { icon:'📋', title:'Antrenman Programları', desc:'Egzersizleri programlara bağlayın, üyelerinize özel rutinler oluşturun.' },
    { icon:'🔐', title:'Rol Tabanlı Erişim', desc:'Admin, Trainer ve Üye rolleriyle herkesin yalnızca yetkili olduğu alanı görmesini sağlayın.' },
    { icon:'📊', title:'Gerçek Zamanlı Takip', desc:'Üyelik durumlarını, ödemeleri ve doluluk oranlarını anlık görüntüleyin.' },
    { icon:'☁️', title:'Bulut Tabanlı', desc:'Hiçbir kurulum derdi yok. Her cihazdan, her yerden erişim.' },
  ];

  const plans = [
    { name:'Başlangıç', price:'₺499', period:'/ay', features:['50 üyeye kadar','1 Admin hesabı','Temel raporlama','Email destek'], highlight:false },
    { name:'Profesyonel', price:'₺999', period:'/ay', features:['250 üyeye kadar','5 Trainer hesabı','Gelişmiş raporlama','Öncelikli destek','Özel marka'], highlight:true },
    { name:'Kurumsal', price:'Özel', period:'', features:['Sınırsız üye','Sınırsız personel','API erişimi','Özel entegrasyon','7/24 destek'], highlight:false },
  ];

  return (
    <div style={{ fontFamily:'Segoe UI,sans-serif', color:'#111827' }}>
      {/* ── NAVBAR ── */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,.85)',
        backdropFilter:'blur(10px)', borderBottom:'1px solid #f0f0f0' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'14px 24px',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Logo />
          <div style={{ display:'flex', gap:32, alignItems:'center' }}>
            <a href="#features" style={{ color:'#374151', textDecoration:'none', fontSize:14, fontWeight:600 }}>Özellikler</a>
            <a href="#pricing"  style={{ color:'#374151', textDecoration:'none', fontSize:14, fontWeight:600 }}>Fiyatlandırma</a>
            <Btn onClick={goLogin} color="#374151" outline size="sm">Giriş Yap</Btn>
            <Btn onClick={goRegister} size="sm">Ücretsiz Başla</Btn>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{ background:`linear-gradient(160deg,${BRAND.dark},${BRAND.dark2} 60%)`,
        padding:'90px 24px 110px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%',
          background:`radial-gradient(circle,${BRAND.primary}33,transparent 70%)` }} />
        <div style={{ position:'absolute', bottom:-150, left:-100, width:400, height:400, borderRadius:'50%',
          background:`radial-gradient(circle,${BRAND.purple}33,transparent 70%)` }} />
        <div style={{ position:'relative', maxWidth:780, margin:'0 auto' }}>
          <Badge label="🚀 Spor Salonları İçin Yeni Nesil Yönetim" color="#fff" />
          <h1 style={{ color:'#fff', fontSize:48, fontWeight:800, lineHeight:1.2, margin:'22px 0 18px' }}>
            Spor Salonunuzu <span style={{ color:BRAND.primary }}>Tek Panelden</span> Yönetin
          </h1>
          <p style={{ color:'#aab2c8', fontSize:17, lineHeight:1.7, maxWidth:560, margin:'0 auto 34px' }}>
            Üyelik takibi, antrenman programları ve egzersiz kütüphanesi — hepsi tek platformda.
            Kurulum yok, donanım yok, sadece sonuç.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Btn onClick={goRegister} size="lg">⚡ Ücretsiz Dene</Btn>
            <Btn onClick={goLogin} size="lg" color="#fff" outline>Giriş Yap</Btn>
          </div>
          <div style={{ display:'flex', gap:40, justifyContent:'center', marginTop:56, flexWrap:'wrap' }}>
            {[['500+','Spor Salonu'],['25K+','Aktif Üye'],['99.9%','Çalışma Süresi']].map(([n,l]) => (
              <div key={l}>
                <div style={{ color:'#fff', fontSize:28, fontWeight:800 }}>{n}</div>
                <div style={{ color:'#8892a4', fontSize:13 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ÖZELLİKLER ── */}
      <div id="features" style={{ maxWidth:1180, margin:'0 auto', padding:'90px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:54 }}>
          <Badge label="ÖZELLİKLER" />
          <h2 style={{ fontSize:34, fontWeight:800, margin:'14px 0 12px' }}>Her Şey Tek Bir Yerde</h2>
          <p style={{ color:'#6b7280', fontSize:15 }}>İhtiyacınız olan her araç, modern ve kolay kullanımlı arayüzde.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {features.map(f => (
            <Card key={f.title} style={{ transition:'transform .15s' }}>
              <div style={{ fontSize:32, marginBottom:14 }}>{f.icon}</div>
              <h3 style={{ margin:'0 0 8px', fontSize:17 }}>{f.title}</h3>
              <p style={{ color:'#6b7280', fontSize:14, lineHeight:1.6, margin:0 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── FİYATLANDIRMA ── */}
      <div id="pricing" style={{ background:'#f8fafc', padding:'90px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:54 }}>
            <Badge label="FİYATLANDIRMA" />
            <h2 style={{ fontSize:34, fontWeight:800, margin:'14px 0 12px' }}>Size Uygun Planı Seçin</h2>
            <p style={{ color:'#6b7280', fontSize:15 }}>Gizli ücret yok, istediğiniz zaman iptal edin.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:22 }}>
            {plans.map(p => (
              <Card key={p.name} style={{
                border: p.highlight ? `2.5px solid ${BRAND.primary}` : '1px solid #f0f0f0',
                position:'relative', transform: p.highlight ? 'scale(1.04)' : 'none',
                boxShadow: p.highlight ? `0 12px 30px ${BRAND.primary}33` : '0 2px 12px rgba(0,0,0,.07)',
              }}>
                {p.highlight && (
                  <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)' }}>
                    <Badge label="EN POPÜLER" />
                  </div>
                )}
                <h3 style={{ margin:'8px 0 6px' }}>{p.name}</h3>
                <div style={{ margin:'14px 0 20px' }}>
                  <span style={{ fontSize:34, fontWeight:800 }}>{p.price}</span>
                  <span style={{ color:'#6b7280', fontSize:14 }}>{p.period}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:'flex', gap:8, fontSize:14, color:'#374151' }}>
                      <span style={{ color:BRAND.primary }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Btn onClick={goRegister} style={{ width:'100%', justifyContent:'center' }}
                  color={p.highlight ? BRAND.primary : '#374151'} outline={!p.highlight}>
                  Başla
                </Btn>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`,
        padding:'70px 24px', textAlign:'center' }}>
        <h2 style={{ color:'#fff', fontSize:30, fontWeight:800, margin:'0 0 14px' }}>
          Spor Salonunuzu Dijitalleştirmeye Hazır mısınız?
        </h2>
        <p style={{ color:'#ffffffcc', marginBottom:28 }}>Kredi kartı gerekmez. 14 gün ücretsiz deneme.</p>
        <Btn onClick={goRegister} size="lg" color="#fff" style={{ color:BRAND.primary, background:'#fff' }}>
          🚀 Hemen Başla
        </Btn>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:BRAND.dark, padding:'36px 24px', textAlign:'center' }}>
        <Logo light />
        <p style={{ color:'#8892a4', fontSize:13, marginTop:14 }}>© 2026 FitLife Pro — Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GİRİŞ SAYFASI (AYRI)
// ════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin, goRegister, goHome }) {
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setErr(''); setLoading(true);
    try {
      const res = await api.auth.login(form);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user',  JSON.stringify(res.user));
      onLogin(res.user);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${BRAND.dark},${BRAND.dark2})`,
      display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Segoe UI,sans-serif', padding:16 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div onClick={goHome} style={{ display:'flex', justifyContent:'center', marginBottom:30, cursor:'pointer' }}>
          <Logo light size={24} />
        </div>

        <Card style={{ padding:34 }}>
          <h2 style={{ margin:'0 0 4px', fontSize:22 }}>Tekrar Hoş Geldiniz 👋</h2>
          <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 24px' }}>Hesabınıza giriş yapın</p>

          {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
            borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

          <Input label="Email" value={form.email} onChange={set('email')} type="email" placeholder="ornek@firma.com" />
          <Input label="Şifre" value={form.password} onChange={set('password')} type="password" placeholder="••••••••" />

          <Btn onClick={submit} style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
            {loading ? 'Giriş yapılıyor...' : '🔐 Giriş Yap'}
          </Btn>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#6b7280' }}>
            Hesabınız yok mu?{' '}
            <button onClick={goRegister}
              style={{ color:BRAND.primary, background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
              Kayıt Olun
            </button>
          </p>
        </Card>

        <p onClick={goHome} style={{ textAlign:'center', marginTop:20, color:'#8892a4', fontSize:13, cursor:'pointer' }}>
          ← Ana sayfaya dön
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// KAYIT SAYFASI (AYRI)
// ════════════════════════════════════════════════════════════════════════════
function RegisterPage({ goLogin, goHome }) {
  const [form, setForm] = useState({ email:'', password:'', fullName:'', role:'member', phone:'' });
  const [err, setErr]   = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setErr(''); setLoading(true);
    try {
      await api.auth.register(form);
      setDone(true);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${BRAND.dark},${BRAND.dark2})`,
      display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Segoe UI,sans-serif', padding:16 }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        <div onClick={goHome} style={{ display:'flex', justifyContent:'center', marginBottom:30, cursor:'pointer' }}>
          <Logo light size={24} />
        </div>

        <Card style={{ padding:34 }}>
          {done ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:52, marginBottom:14 }}>🎉</div>
              <h2 style={{ margin:'0 0 8px' }}>Kayıt Başarılı!</h2>
              <p style={{ color:'#6b7280', marginBottom:24 }}>Artık giriş yapabilirsiniz.</p>
              <Btn onClick={goLogin} style={{ width:'100%', justifyContent:'center' }}>Giriş Yap →</Btn>
            </div>
          ) : (
            <>
              <h2 style={{ margin:'0 0 4px', fontSize:22 }}>Hesap Oluştur</h2>
              <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 22px' }}>14 gün ücretsiz, kart gerekmez</p>

              {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
                borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

              <Input label="Ad Soyad" value={form.fullName} onChange={set('fullName')} placeholder="Ali Yılmaz" />
              <Input label="Telefon"  value={form.phone}    onChange={set('phone')} placeholder="05XX XXX XX XX" />
              <Input label="Email"    value={form.email}    onChange={set('email')} type="email" placeholder="ornek@firma.com" />
              <Input label="Şifre"    value={form.password} onChange={set('password')} type="password" placeholder="En az 6 karakter" />

              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', marginBottom:8, fontSize:13, color:'#6b7280', fontWeight:600 }}>Hesap Türü</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  
                </div>
              </div>

              <Btn onClick={submit} style={{ width:'100%', justifyContent:'center' }}>
                {loading ? 'Oluşturuluyor...' : '⚡ Kayıt Ol'}
              </Btn>

              <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#6b7280' }}>
                Zaten hesabınız var mı?{' '}
                <button onClick={goLogin}
                  style={{ color:BRAND.primary, background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
                  Giriş Yapın
                </button>
              </p>
            </>
          )}
        </Card>

        <p onClick={goHome} style={{ textAlign:'center', marginTop:20, color:'#8892a4', fontSize:13, cursor:'pointer' }}>
          ← Ana sayfaya dön
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADMIN / TRAINER DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ user, onLogout }) {
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
      if (tab === 'programs') {
        const [p, e] = await Promise.all([api.programs.getAll(), api.exercises.getAll()]);
        setPrograms(p); setExs(e);
      }
    } catch (e) { alert(e.message); }
  };
  useEffect(() => { load(); }, [tab]);

  const openAdd  = (type) => { setForm({}); setModal({ type, item: null }); };
  const openEdit = (type, item) => { setForm(item); setModal({ type, item }); };

  const save = async () => {
    try {
      const t = modal.type;
      if (t === 'plan') {
        modal.item
          ? await api.plans.update(modal.item.id, form)
          : await api.plans.create({ ...form, durationMonths: +form.durationMonths, price: +form.price });
      }
      if (t === 'exercise') {
        modal.item
          ? await api.exercises.update(modal.item.id, form)
          : await api.exercises.create({ ...form, sets: +form.sets, reps: +form.reps });
      }
      if (t === 'program') {
        modal.item
          ? await api.programs.update(modal.item.id, form)
          : await api.programs.create({ ...form, weeksCount: +form.weeksCount });
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
      load();  // listeyi tazele
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

  const ALL_TABS = [
    { id:'users',       label:'🧑‍🤝‍🧑 Üyeler',          roles:['admin','trainer'] },
    { id:'mymembers',   label:'💪 PT Üyelerim',         roles:['trainer'] },
    { id:'plans',       label:'📦 Üyelik Paketleri',    roles:['admin'] },
    { id:'enrollments', label:'👥 Üyelikler',           roles:['admin','trainer'] },
    { id:'exercises',   label:'🏋️ Egzersizler',         roles:['admin','trainer'] },
    { id:'programs',    label:'📋 Programlar',           roles:['admin','trainer'] },
  ];
  const TABS = ALL_TABS.filter(t => t.roles.includes(user.role));
  const color = { users:'#e94560', plans:'#3b82f6', enrollments:'#10b981', exercises:'#f59e0b', programs:'#8b5cf6' };
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
              padding:'9px 20px', borderRadius:10, border:`2px solid ${tab===t.id?color[t.id]:'#e5e7eb'}`,
              background: tab===t.id ? color[t.id] : '#fff',
              color: tab===t.id ? '#fff' : '#374151',
              fontWeight:600, fontSize:14, cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>

{tab === 'users' && (
  <div>
    <h2 style={{ margin:'0 0 16px' }}>Kayıtlı Kullanıcılar ({users.length})</h2>
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
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
      </div>

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
// ════════════════════════════════════════════════════════════════════════════
// PROGRAMIM SEKMESİ (profil formu + program üretme/görüntüleme)
// ════════════════════════════════════════════════════════════════════════════
function MyProgramTab() {
  const [profile, setProfile]   = useState(null);
  const [program, setProgram]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [generating, setGen]    = useState(false);
  const [history, setHistory] = useState([]);
const [showHistory, setShowHistory] = useState(false);
  const [err, setErr]           = useState('');
  const [form, setForm] = useState({
    heightCm:'', weightKg:'', age:'', gender:'male',
    targetWeightKg:'', weeklyWorkoutDays:'3', activityLevel:'moderate',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // İlk yükleme: profil ve aktif program var mı?
  const load = async () => {
    setLoading(true);
    try {
      const p = await api.healthProfile.getMine();
      setProfile(p);
      if (p) {
        setForm({
          heightCm: p.heightCm, weightKg: p.weightKg, age: p.age, gender: p.gender,
          targetWeightKg: p.targetWeightKg, weeklyWorkoutDays: p.weeklyWorkoutDays,
          activityLevel: p.activityLevel,
        });
        const active = await api.fitness.active();
        setProgram(active);
        const hist = await api.fitness.history();
        setHistory(hist);
      }
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    setErr(''); setSaving(true);
    try {
      const payload = {
        heightCm: +form.heightCm, weightKg: +form.weightKg, age: +form.age,
        gender: form.gender, targetWeightKg: +form.targetWeightKg,
        weeklyWorkoutDays: +form.weeklyWorkoutDays, activityLevel: form.activityLevel,
      };
      const saved = await api.healthProfile.save(payload);
      setProfile(saved);
      const active = await api.fitness.active();
      setProgram(active);
      const hist = await api.fitness.history();
      setHistory(hist);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const generate = async () => {
    setErr(''); setGen(true);
    try {
      const prog = await api.fitness.generate();
      setProgram(prog);
      const hist = await api.fitness.history();
      setHistory(hist);
    } catch (e) { setErr(e.message); }
    setGen(false);
  };

  if (loading) return <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>;

  const goalLabel = { gain:'Kilo Alma', lose:'Kilo Verme', maintain:'Koruma' };

const daysLeft = program
    ? Math.ceil((new Date(program.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div>
      {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
        borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

      {/* ── PROFİL FORMU ── */}
      <Card style={{ marginBottom:20 }}>
        <h3 style={{ margin:'0 0 4px' }}>{profile ? '📋 Sağlık Bilgilerim' : '👋 Önce Bilgilerini Gir'}</h3>
        <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 18px' }}>
          {profile ? 'Bilgilerini güncelleyip programını yeniden oluşturabilirsin.' : 'Sana özel program için bu bilgiler gerekli.'}
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Boy (cm)"      value={form.heightCm}       onChange={set('heightCm')} type="number" placeholder="178" />
          <Input label="Kilo (kg)"     value={form.weightKg}       onChange={set('weightKg')} type="number" placeholder="70" />
          <Input label="Yaş"           value={form.age}            onChange={set('age')} type="number" placeholder="25" />
          <Input label="Hedef Kilo (kg)" value={form.targetWeightKg} onChange={set('targetWeightKg')} type="number" placeholder="75" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:4 }}>
          <Select label="Cinsiyet" value={form.gender} onChange={set('gender')}
            options={[
              { value:'male', label:'Erkek' },
              { value:'female', label:'Kadın' },
            ]} />
          <Select label="Haftalık Gün" value={form.weeklyWorkoutDays} onChange={set('weeklyWorkoutDays')}
            options={[1,2,3,4,5,6,7].map(n => ({ value:n, label:`${n} gün` }))} />
          <Select label="Aktivite" value={form.activityLevel} onChange={set('activityLevel')}
            options={[
              { value:'sedentary', label:'Hareketsiz' },
              { value:'light', label:'Hafif' },
              { value:'moderate', label:'Orta' },
              { value:'active', label:'Aktif' },
              { value:'very_active', label:'Çok Aktif' },
            ]} />
        </div>
        <Btn onClick={saveProfile} style={{ marginTop:16 }}>
          {saving ? 'Kaydediliyor...' : profile ? '💾 Bilgileri Güncelle' : '✓ Kaydet'}
        </Btn>
      </Card>

      {/* ── PROGRAM ÜRETME / GÖRÜNTÜLEME ── */}
      {profile && (
        <Card style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h3 style={{ margin:'0 0 4px' }}>🎯 Antrenman & Diyet Programı</h3>
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>
              {program ? 'Yeni oluşturursan mevcut program geçmişe taşınır.' : 'Bilgilerine göre kişisel programını oluştur.'}
            </p>
          </div>
          <Btn onClick={generate} color="#8b5cf6">
            {generating ? 'Oluşturuluyor...' : program ? '🔄 Yeniden Oluştur' : '⚡ Program Oluştur'}
          </Btn>
        </Card>
      )}

      {/* ── ÜRETİLEN PROGRAM ── */}
      {program && (
        <>
          {/* Özet + diyet */}
          <Card style={{ marginBottom:16 }}>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <Badge label={goalLabel[program.goal] || program.goal} color="#8b5cf6" />
              <Badge label={`${program.startWeightKg} → ${program.targetWeightKg} kg`} color="#3b82f6" />
              <Badge label={`${program.durationWeeks} hafta`} color="#10b981" />
              <Badge label={`${program.startDate} → ${program.endDate}`} color="#6b7280" />
              <Badge label={`⏳ ${daysLeft} gün kaldı`} color="#e94560" />
            </div>
            {program.warnings && program.warnings.length > 0 && (
              <div style={{ marginBottom:16 }}>
                {program.warnings.map((w, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start',
                    background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10,
                    padding:'12px 14px', marginBottom:8 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
                    <span style={{ fontSize:13, color:'#92400e', lineHeight:1.5 }}>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
            <h4 style={{ margin:'0 0 12px' }}>🍎 Günlük Beslenme Hedefi</h4>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[
                ['Kalori', program.dailyCalories, 'kcal', '#e94560'],
                ['Protein', program.proteinG, 'g', '#3b82f6'],
                ['Karbonhidrat', program.carbsG, 'g', '#f59e0b'],
                ['Yağ', program.fatG, 'g', '#10b981'],
              ].map(([label, val, unit, c]) => (
                <div key={label} style={{ background:c+'10', border:`1px solid ${c}33`, borderRadius:10, padding:'14px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:800, color:c }}>{val}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>{label} ({unit})</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Antrenman planı */}
          <h4 style={{ margin:'0 0 12px' }}>🏋️ Haftalık Antrenman Planı</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {program.workoutPlan.map((day) => (
              <Card key={day.day}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'#8b5cf6', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14 }}>
                    {day.day}
                  </div>
                  <h4 style={{ margin:0 }}>Gün {day.day} — {day.focus}</h4>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  {day.exercises.map((ex) => (
                    <div key={ex.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                      background:'#f8fafc', borderRadius:8, padding:'10px 14px' }}>
                      <div>
                        <span style={{ fontWeight:600, fontSize:14 }}>{ex.name}</span>
                        <span style={{ color:'#9ca3af', fontSize:12, marginLeft:8 }}>{ex.equipment}</span>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <Badge label={ex.muscleGroup} color="#f59e0b" />
                        <Badge label={`${ex.sets}×${ex.reps}`} color="#3b82f6" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <p style={{ color:'#9ca3af', fontSize:12, marginTop:16, textAlign:'center' }}>
            ⚠️ Bu program genel hesaplamalara dayanır. Sağlık durumunuza göre bir uzmana danışın.
          </p>
          {/* ── GEÇMİŞ PROGRAMLAR ── */}
          {history.filter(h => !h.isActive).length > 0 && (
            <div style={{ marginTop:24 }}>
              <div
                onClick={() => setShowHistory(!showHistory)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  cursor:'pointer', padding:'12px 0' }}>
                <h4 style={{ margin:0 }}>
                  📚 Geçmiş Programlar ({history.filter(h => !h.isActive).length})
                </h4>
                <span style={{ color:'#8b5cf6', fontSize:13, fontWeight:600 }}>
                  {showHistory ? 'Gizle ▲' : 'Göster ▼'}
                </span>
              </div>

              {showHistory && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {history.filter(h => !h.isActive).map((h) => (
                    <Card key={h.id} style={{ background:'#fafafa' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <Badge label={goalLabel[h.goal] || h.goal} color="#8b5cf6" />
                          <Badge label={`${h.startWeightKg} → ${h.targetWeightKg} kg`} color="#3b82f6" />
                          <Badge label={`${h.durationWeeks} hafta`} color="#10b981" />
                        </div>
                        <div style={{ color:'#9ca3af', fontSize:12 }}>
                          {new Date(h.createdAt).toLocaleDateString('tr')} · {h.dailyCalories} kcal
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MEMBER DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function MemberDashboard({ user, onLogout }) {
  const [tab, setTab]       = useState('plans');
  const [plans, setPlans]   = useState([]);
  const [mine, setMine]     = useState([]);
  const [progs, setProgs]   = useState([]);

  const load = async () => {
    try {
      if (tab === 'plans')    setPlans((await api.plans.getAll()).filter(p => p.isActive));
      if (tab === 'mine')     setMine(await api.enrollments.getMine());
      if (tab === 'programs') setProgs(await api.programs.getAll());
    } catch (e) { alert(e.message); }
  };
  useEffect(() => { load(); }, [tab]);

  const enroll = async (planId) => {
    try { await api.enrollments.create(planId); alert('Üyelik başarıyla oluşturuldu! 🎉'); load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
      <div style={{ background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`, padding:'14px 28px',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Logo light />
        <div style={{ display:'flex', gap:12, alignItems:'center', color:'#fff' }}>
          <span style={{ fontSize:14 }}>👤 {user.fullName}</span>
          <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {[
            { id:'plans',    label:'📦 Paketler' },
            { id:'mine',     label:'🎫 Üyeliklerim' },
            { id:'programs', label:'📋 Programlar' },
            { id:'myprogram', label:'🎯 Programım' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'9px 22px', borderRadius:10, border:`2px solid ${tab===t.id?BRAND.primary:'#e5e7eb'}`,
              background: tab===t.id ? BRAND.primary : '#fff',
              color: tab===t.id ? '#fff' : '#374151',
              fontWeight:600, fontSize:14, cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'plans' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {plans.map(p => (
              <Card key={p.id} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <h3 style={{ margin:0 }}>{p.name}</h3>
                <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>{p.description}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f0f0f0', paddingTop:12 }}>
                  <Badge label={`${p.durationMonths} Ay`} color="#3b82f6" />
                  <span style={{ fontSize:24, fontWeight:800, color:BRAND.primary }}>{p.price} ₺</span>
                </div>
                <Btn onClick={() => enroll(p.id)} style={{ width:'100%', justifyContent:'center' }}>
                  🎯 Üye Ol
                </Btn>
              </Card>
            ))}
          </div>
        )}

        {tab === 'mine' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mine.length === 0 && (
              <Card style={{ textAlign:'center', padding:40 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🎫</div>
                <p style={{ color:'#6b7280', margin:0 }}>Henüz üyeliğiniz bulunmuyor.</p>
              </Card>
            )}
            {mine.map(e => (
              <Card key={e.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <h4 style={{ margin:'0 0 4px' }}>{e.plan?.name}</h4>
                  <div style={{ color:'#6b7280', fontSize:13 }}>
                    {new Date(e.startDate).toLocaleDateString('tr')} → {new Date(e.endDate).toLocaleDateString('tr')}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#10b981' }}>{e.amountPaid} ₺</div>
                  <Badge label={e.status === 'active' ? 'Aktif' : 'Pasif'} color={e.status === 'active' ? '#10b981' : '#6b7280'} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'programs' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {progs.map(p => (
              <Card key={p.id}>
                <h3 style={{ margin:'0 0 6px' }}>{p.name}</h3>
                <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 12px' }}>{p.description}</p>
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <Badge label={p.difficulty} color="#8b5cf6" />
                  <Badge label={`${p.weeksCount} Hafta`} color="#10b981" />
                  <Badge label={`${(p.exercises||[]).length} Egzersiz`} color="#f59e0b" />
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  {(p.exercises || []).map(e => (
                    <div key={e.id} style={{ display:'flex', justifyContent:'space-between',
                      background:'#f8fafc', borderRadius:8, padding:'10px 14px', fontSize:14 }}>
                      <span style={{ fontWeight:500 }}>{e.name}</span>
                      <div style={{ display:'flex', gap:8 }}>
                        <Badge label={e.category} color="#f59e0b" />
                        <Badge label={`${e.sets}×${e.reps}`} color="#3b82f6" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
        {tab === 'myprogram' && <MyProgramTab />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ANA UYGULAMA — ROUTER (state-based)
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState('landing'); // landing | login | register | app
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) { setUser(JSON.parse(u)); setPage('app'); }
  }, []);

  const handleLogin = (u) => { setUser(u); setPage('app'); };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('landing');
  };

  if (page === 'landing') return (
    <LandingPage goLogin={() => setPage('login')} goRegister={() => setPage('register')} />
  );

  if (page === 'login') return (
    <LoginPage onLogin={handleLogin} goRegister={() => setPage('register')} goHome={() => setPage('landing')} />
  );

  if (page === 'register') return (
    <RegisterPage goLogin={() => setPage('login')} goHome={() => setPage('landing')} />
  );

  // page === 'app'
  if (!user) return <LandingPage goLogin={() => setPage('login')} goRegister={() => setPage('register')} />;

  return user.role === 'admin' || user.role === 'trainer'
    ? <AdminDashboard user={user} onLogout={logout} />
    : <MemberDashboard user={user} onLogout={logout} />;
}