import React, { useState } from 'react';
import { FaLock, FaRegSmile, FaKey, FaEnvelope } from 'react-icons/fa';
import { BRAND, Btn, Card, Input, Logo } from '../components/ui';
import api from '../api';

export default function LoginPage({ onLogin, goRegister, goHome }) {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [form, setForm] = useState({ email:'', password:'' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [err, setErr]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setErr(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await api.auth.login(form);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user',  JSON.stringify(res.user));
      onLogin(res.user);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { setErr('Lütfen e-posta adresinizi giriniz.'); return; }
    setErr(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail.trim());
      setSuccessMsg(res.message || 'Sıfırlama kodu gönderildi.');
      if (res.code) {
        setSimulatedCode(res.code);
        setResetToken(res.code); // Otomatik doldur (test kolaylığı için)
      }
      setMode('reset');
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) { setErr('Lütfen sıfırlama kodunu giriniz.'); return; }
    if (!newPassword) { setErr('Lütfen yeni şifrenizi giriniz.'); return; }
    if (newPassword !== confirmPassword) { setErr('Şifreler uyuşmuyor.'); return; }
    setErr(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await api.auth.resetPassword(resetToken.trim(), newPassword);
      setSuccessMsg(res.message || 'Şifreniz başarıyla sıfırlandı.');
      // Sıfırlama bitince bilgileri temizle
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setSimulatedCode('');
      setMode('login');
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
          {mode === 'login' && (
            <>
              <h2 style={{ margin:'0 0 4px', fontSize:22, display:'flex', alignItems:'center', gap:8 }}>Tekrar Hoş Geldiniz <FaRegSmile color={BRAND.primary} /></h2>
              <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 24px' }}>Hesabınıza giriş yapın</p>

              {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14, whiteSpace:'pre-line' }}>{err}</div>}
              {successMsg && <div style={{ background:'#dcfce7', border:'1px solid #bbf7d0', color:'#16a34a', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{successMsg}</div>}

              <Input label="Email" value={form.email} onChange={set('email')} type="email" placeholder="ornek@firma.com" />
              <Input label="Şifre" value={form.password} onChange={set('password')} type="password" placeholder="••••••••" />

              <div style={{ textAlign:'right', marginBottom:16, marginTop:-8 }}>
                <button onClick={() => { setMode('forgot'); setErr(''); setSuccessMsg(''); }}
                  style={{ color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontSize:13 }}>
                  Şifremi Unuttum
                </button>
              </div>

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
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 style={{ margin:'0 0 4px', fontSize:22, display:'flex', alignItems:'center', gap:8 }}>Şifremi Unuttum <FaKey color={BRAND.primary} /></h2>
              <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 24px' }}>Hesabınıza ait e-posta adresini girin, şifre sıfırlama kodu gönderelim.</p>

              {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14, whiteSpace:'pre-line' }}>{err}</div>}

              <Input label="E-posta Adresi" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} type="email" placeholder="ornek@firma.com" />

              <Btn onClick={handleForgotPassword} style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
                {loading ? 'Kod Gönderiliyor...' : <><FaEnvelope /> Kod Gönder</>}
              </Btn>

              <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#6b7280' }}>
                <button onClick={() => { setMode('login'); setErr(''); setSuccessMsg(''); }}
                  style={{ color:BRAND.primary, background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
                  Giriş Sayfasına Dön
                </button>
              </p>
            </>
          )}

          {mode === 'reset' && (
            <>
              <h2 style={{ margin:'0 0 4px', fontSize:22, display:'flex', alignItems:'center', gap:8 }}>Şifreyi Sıfırla <FaLock color={BRAND.primary} /></h2>
              <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 24px' }}>E-posta adresinize gönderilen 6 haneli kodu ve yeni şifrenizi girin.</p>

              {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14, whiteSpace:'pre-line' }}>{err}</div>}
              {simulatedCode && (
                <div style={{ background:'#e0f2fe', border:'1px solid #bae6fd', color:'#0369a1', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14, fontWeight:600 }}>
                  Simüle Edilen Kod: {simulatedCode} (Kutucuğa otomatik yazıldı)
                </div>
              )}

              <Input label="Sıfırlama Kodu (6 Hane)" value={resetToken} onChange={(e) => setResetToken(e.target.value)} type="text" placeholder="123456" />
              <Input label="Yeni Şifre" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="••••••••" />
              <Input label="Yeni Şifre (Tekrar)" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="••••••••" />

              <Btn onClick={handleResetPassword} style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
                {loading ? 'Şifre Güncelleniyor...' : <><FaLock /> Şifreyi Güncelle</>}
              </Btn>

              <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#6b7280' }}>
                <button onClick={() => { setMode('login'); setErr(''); setSuccessMsg(''); }}
                  style={{ color:BRAND.primary, background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
                  Giriş Sayfasına Dön
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