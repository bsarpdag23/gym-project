import React, { useState } from 'react';
import { FaLock, FaRegSmile } from 'react-icons/fa';
import { BRAND, Btn, Card, Input, Logo } from '../components/ui';
import api from '../api';

export default function LoginPage({ onLogin, goRegister, goHome }) {
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
          <h2 style={{ margin:'0 0 4px', fontSize:22, display:'flex', alignItems:'center', gap:8 }}>Tekrar Hoş Geldiniz <FaRegSmile color={BRAND.primary} /></h2>
          <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 24px' }}>Hesabınıza giriş yapın</p>

          {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
            borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

          <Input label="Email" value={form.email} onChange={set('email')} type="email" placeholder="ornek@firma.com" />
          <Input label="Şifre" value={form.password} onChange={set('password')} type="password" placeholder="••••••••" />

          <Btn onClick={submit} style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
            {loading ? 'Giriş yapılıyor...' : <><FaLock /> Giriş Yap</>}
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