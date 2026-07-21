import React, { useState, useEffect } from 'react';
import { FaBolt, FaCheckCircle } from 'react-icons/fa';
import { BRAND, Btn, Card, Input, Select, Logo } from '../components/ui';
import api from '../api';

export default function RegisterPage({ goLogin, goHome }) {
  const [gyms, setGyms] = useState([]);
  const [form, setForm] = useState({ email:'', password:'', fullName:'', role:'member', phone:'', gymId:'' });
  const [err, setErr]   = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    (async () => {
      try {
        const list = await api.gyms.getPublicList();
        if (Array.isArray(list) && list.length > 0) {
          setGyms(list);
          setForm(f => ({ ...f, gymId: list[0].id }));
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  const submit = async () => {
    setErr(''); setLoading(true);
    try {
      await api.auth.register({
        ...form,
        gymId: form.gymId ? Number(form.gymId) : 1,
      });
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
              <div style={{ marginBottom:14, display:'flex', justifyContent:'center' }}><FaCheckCircle size={52} color="#10b981" /></div>
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
              
              {gyms.length > 0 && (
                <Select
                  label="Spor Salonu Seçin"
                  value={form.gymId}
                  onChange={set('gymId')}
                  options={gyms.map(g => ({
                    value: g.id,
                    label: `${g.name}${g.address ? ` (${g.address})` : ''}`
                  }))}
                />
              )}

              <Input label="Email"    value={form.email}    onChange={set('email')} type="email" placeholder="ornek@firma.com" />
              <Input label="Şifre"    value={form.password} onChange={set('password')} type="password" placeholder="En az 6 karakter" />

              <Btn onClick={submit} style={{ width:'100%', justifyContent:'center' }}>
                {loading ? 'Oluşturuluyor...' : <><FaBolt /> Kayıt Ol</>}
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