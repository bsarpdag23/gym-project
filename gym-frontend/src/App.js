import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './dashboards/AdminDashboard';
import MemberDashboard from './dashboards/MemberDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';

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

  if (user.role === 'super_admin')
    return <SuperAdminDashboard user={user} onLogout={logout} />;

  return user.role === 'admin' || user.role === 'trainer'
    ? <AdminDashboard user={user} onLogout={logout} />
    : <MemberDashboard user={user} onLogout={logout} />;
}