import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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

  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) setUser(JSON.parse(u));
    setLoaded(true);
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
    </BrowserRouter>
  );
}
