import React, { useState } from 'react';
import { Logo, ThemeToggleBtn, Avatar } from './ui';
import { useTheme } from '../context/ThemeContext';
import { resolveAvatarUrl } from '../api';

export default function Header({ user, onLogout, titleExtra, rightActions, onNavigate }) {
  const { isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div style={{
      background: isDark ? 'rgba(11, 15, 25, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      padding: '14px 28px',
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Logo light={isDark} />
        {titleExtra}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ThemeToggleBtn />
        {rightActions}

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex', gap: 10, alignItems: 'center',
              color: 'var(--text-main)', cursor: 'pointer',
              padding: '6px 12px', borderRadius: 20,
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
              transition: 'background .15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
            onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'; }}
          >
            <Avatar src={resolveAvatarUrl(user?.avatarUrl)} name={user?.fullName} size={28} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.fullName}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
          </div>

          {showUserMenu && (
            <>
              <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
              <div style={{
                position: 'absolute', top: 48, right: 0,
                background: isDark ? '#111827' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                borderRadius: 14,
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.06)',
                zIndex: 999, padding: '6px 0',
                width: 170, display: 'flex', flexDirection: 'column',
                animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {onNavigate && (
                  <>
                    <button onClick={() => { setShowUserMenu(false); onNavigate('profile'); }} style={{
                      background: 'none', border: 'none', padding: '10px 16px',
                      color: isDark ? '#f8fafc' : '#1e293b',
                      textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background .15s'
                    }} onMouseEnter={e => e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
                      onMouseLeave={e => e.target.style.background = 'none'}>
                      👤 Profil & Diyet
                    </button>
                    <button onClick={() => { setShowUserMenu(false); onNavigate('chat'); }} style={{
                      background: 'none', border: 'none', padding: '10px 16px',
                      color: isDark ? '#f8fafc' : '#1e293b',
                      textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background .15s'
                    }} onMouseEnter={e => e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
                      onMouseLeave={e => e.target.style.background = 'none'}>
                      💬 Sohbet
                    </button>
                  </>
                )}
                <button onClick={() => { setShowUserMenu(false); onLogout(); }} style={{
                  background: 'none', border: 'none', padding: '10px 16px', color: '#ef4444',
                  textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9', transition: 'background .15s'
                }} onMouseEnter={e => e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
                  onMouseLeave={e => e.target.style.background = 'none'}>
                  🚪 Çıkış Yap
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
