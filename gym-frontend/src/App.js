import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GymDetailPage from './pages/GymDetailPage';
import AdminDashboard from './dashboards/AdminDashboard';
import MemberDashboard from './dashboards/MemberDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import { disconnectSocket } from './socket';

function homePathFor(user) {
  if (!user) return '/';
  if (user.role === 'super_admin') return '/super-admin';
  if (user.role === 'admin' || user.role === 'trainer') return '/admin';
  return '/member';
}

function AppRoutes({ user, onLogin, onLogout }) {
  const navigate = useNavigate();
  const home = homePathFor(user);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={home} replace /> :
        <LandingPage goLogin={() => navigate('/login')} goRegister={() => navigate('/register')} />} />

      <Route path="/gym/:gymId" element={<GymDetailPage />} />

      <Route path="/login" element={user ? <Navigate to={home} replace /> :
        <LoginPage onLogin={onLogin} goRegister={() => navigate('/register')} goHome={() => navigate('/')} />} />

      <Route path="/register" element={user ? <Navigate to={home} replace /> :
        <RegisterPage goLogin={() => navigate('/login')} goHome={() => navigate('/')} />} />

      <Route path="/super-admin/*" element={
        user?.role === 'super_admin'
          ? <SuperAdminDashboard user={user} onLogout={onLogout} />
          : <Navigate to="/login" replace />
      } />

      <Route path="/admin/*" element={
        user?.role === 'admin' || user?.role === 'trainer'
          ? <AdminDashboard user={user} onLogout={onLogout} />
          : <Navigate to="/login" replace />
      } />

      <Route path="/member/*" element={
        user?.role === 'member'
          ? <MemberDashboard user={user} onLogout={onLogout} />
          : <Navigate to="/login" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) setUser(JSON.parse(u));
    setLoaded(true);
  }, []);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const newToast = { id: Date.now(), message: e.detail.message, type: e.detail.type || 'info' };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('show-toast', handleToastEvent);
    
    // Override window.alert
    window.alert = (msg) => {
      if (msg === null || msg === undefined) return;
      let text = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
      
      const lower = text.toLowerCase();
      const isSuccess = lower.includes('başarıyla') || 
                        lower.includes('başarılı') || 
                        lower.includes('kopyalandı') || 
                        lower.includes('güncellendi') || 
                        lower.includes('sıfırlandı') ||
                        lower.includes('temizlendi') ||
                        lower.includes('kaydedildi');

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: text, type: isSuccess ? 'success' : 'info' }
      }));
    };

    return () => {
      window.removeEventListener('show-toast', handleToastEvent);
    };
  }, []);

  const handleLogin = (u) => setUser(u);
  const logout = () => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!loaded) return null;

  return (
    <BrowserRouter>
      <AppRoutes user={user} onLogin={handleLogin} onLogout={logout} />
      
      {/* Global Toast Container */}
      <div style={{ position:'fixed', top:24, right:24, zIndex:10000, display:'flex', flexDirection:'column', gap:10, maxWidth:360, width:'calc(100% - 48px)' }}>
        {toasts.map(t => (
          <div key={t.id} className="slide-in" style={{
            background: t.type === 'success' ? '#10b981' : '#e94560',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: 14,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            fontFamily: 'Segoe UI, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            boxSizing: 'border-box',
          }}>
            <span style={{ fontSize: 18 }}>{t.type === 'success' ? '✓' : 'ℹ'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </BrowserRouter>
  );
}
