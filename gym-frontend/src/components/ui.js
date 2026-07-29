import React from 'react';
import { FaBolt, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export const BRAND = {
  primary: '#06b6d4',       // Neon Cyan
  primaryHover: '#0891b2',
  dark: '#0b0f19',          // Midnight dark background
  dark2: '#111827',         // Dark Slate 900
  purple: '#7c3aed',        // Deep Purple / Violet
  accent: '#06b6d4',
  pink: '#ec4899'
};

export function ThemeToggleBtn() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
      style={{
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
        color: isDark ? '#f59e0b' : '#6366f1',
        borderRadius: 12,
        padding: '8px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 13,
        transition: 'all 0.2s ease',
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
      }}
    >
      {isDark ? <FaSun size={15} color="#f59e0b" /> : <FaMoon size={15} color="#6366f1" />}
      <span style={{ color: 'var(--text-main)' }}>{isDark ? 'Aydınlık' : 'Karanlık'}</span>
    </button>
  );
}

// ─── Ortak UI bileşenleri ─────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = 'text', placeholder }) {
  const { isDark } = useTheme() || { isDark: true };

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:6, fontSize:13, color: isDark ? '#94a3b8' : '#475569', fontWeight:600 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width:'100%', padding:'12px 16px',
          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          borderRadius:12, fontSize:14, outline:'none', boxSizing:'border-box',
          background: isDark ? '#0f172a' : '#fff',
          color: isDark ? '#f8fafc' : '#1e293b',
          transition:'border-color .15s, box-shadow .15s'
        }}
        onFocus={e => {
          e.target.style.borderColor = BRAND.primary;
          e.target.style.boxShadow = `0 0 0 3px ${BRAND.primary}30`;
        }}
        onBlur={e => {
          e.target.style.borderColor = isDark ? '#1e293b' : '#e2e8f0';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  const { isDark } = useTheme() || { isDark: true };

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:6, fontSize:13, color: isDark ? '#94a3b8' : '#475569', fontWeight:600 }}>{label}</label>}
      <select
        value={value} onChange={onChange}
        style={{
          width:'100%', padding:'12px 16px',
          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          borderRadius:12, fontSize:14,
          background: isDark ? '#0f172a' : '#fff',
          color: isDark ? '#f8fafc' : '#1e293b',
          boxSizing:'border-box', outline:'none',
          transition:'border-color .15s'
        }}
        onFocus={e => e.target.style.borderColor = BRAND.primary}
        onBlur={e => e.target.style.borderColor = isDark ? '#1e293b' : '#e2e8f0'}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: isDark ? '#0f172a' : '#fff', color: isDark ? '#f8fafc' : '#1e293b' }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Btn({ children, onClick, color = BRAND.primary, outline, size = 'md', style = {} }) {
  const pad = size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 36px' : '11px 24px';
  const radius = 12;
  const isCustomColor = color !== BRAND.primary;
  
  return (
    <button onClick={onClick} style={{
      padding: pad, fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14, fontWeight: 700, borderRadius: radius, cursor:'pointer',
      background: outline ? 'transparent' : (isCustomColor ? color : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.purple})`),
      border: outline ? `1.5px solid ${color}` : 'none',
      color: outline ? color : '#fff',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
      boxShadow: outline ? 'none' : `0 4px 14px ${color}35`,
      transition:'transform .15s, box-shadow .15s, opacity .15s',
      ...style,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-1.5px)';
      if (!outline) e.currentTarget.style.boxShadow = `0 6px 20px ${color}50`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      if (!outline) e.currentTarget.style.boxShadow = `0 4px 14px ${color}35`;
    }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style = {}, onClick }) {
  const { isDark } = useTheme() || { isDark: true };

  return (
    <div onClick={onClick} style={{
      background: isDark ? 'rgba(17, 24, 39, 0.75)' : '#fff',
      backdropFilter: isDark ? 'blur(12px)' : 'none',
      borderRadius: 16, padding: 22,
      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
      boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 30px rgba(0,0,0,0.04)',
      color: isDark ? '#f8fafc' : '#1e293b',
      transition: 'transform .15s, border-color .15s, background-color .2s',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
    onMouseEnter={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = isDark ? BRAND.primary : '#e2e8f0';
      }
    }}
    onMouseLeave={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';
      }
    }}
    >
      {children}
    </div>
  );
}

export function Avatar({ src, name, size = 36 }) {
  const initials = (name || '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      background: src ? '#1e293b' : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.purple})`,
      color:'#fff', fontWeight:700, fontSize: size * 0.38,
      border: '1.5px solid rgba(255,255,255,0.2)'
    }}>
      {src
        ? <img src={src} alt={name || 'avatar'} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : (initials || '?')}
    </div>
  );
}

export function Badge({ label, color = BRAND.primary }) {
  return (
    <span style={{
      background: color + '1a', color, border:`1px solid ${color}40`,
      borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:600,
      display:'inline-flex', alignItems:'center', gap:4
    }}>
      {label}
    </span>
  );
}

export function ProgressBar({ value, max = 100, color = BRAND.primary, label, height = 10 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const { isDark } = useTheme() || { isDark: true };

  return (
    <div>
      {label && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12, color: isDark ? '#94a3b8' : '#64748b' }}>
          <span>{label}</span>
          <span style={{ fontWeight:700, color: isDark ? '#f8fafc' : '#1e293b' }}>{value}/{max}</span>
        </div>
      )}
      <div style={{ width:'100%', height, borderRadius: height, background: isDark ? '#1e293b' : '#e2e8f0', overflow:'hidden' }}>
        <div style={{
          width:`${percent}%`, height:'100%', borderRadius: height,
          background: `linear-gradient(90deg, ${color}, ${BRAND.purple})`,
          transition:'width .4s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  const { isDark } = useTheme() || { isDark: true };

  return (
    <div style={{
      position:'fixed', inset:0, background: isDark ? 'rgba(5, 8, 15, 0.75)' : 'rgba(15, 23, 42, 0.45)',
      backdropFilter:'blur(10px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16
    }}>
      <div style={{
        background: isDark ? '#0f172a' : '#fff',
        borderRadius:20, padding:32, width:'100%', maxWidth:460,
        boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
        animation:'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: isDark ? '#f8fafc' : '#1e293b'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color: isDark ? '#f8fafc' : '#1e293b' }}>{title}</h3>
          <button onClick={onClose} style={{
            background:'none', border:'none', fontSize:26,
            cursor:'pointer', color: isDark ? '#94a3b8' : '#64748b', lineHeight:1, transition:'color .15s'
          }}
          onMouseEnter={e => e.target.style.color = isDark ? '#f8fafc' : '#1e293b'}
          onMouseLeave={e => e.target.style.color = isDark ? '#94a3b8' : '#64748b'}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Logo({ light, size = 22 }) {
  const { isDark } = useTheme() || { isDark: true };
  const isLightText = light !== undefined ? light : isDark;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{
        width:size+14, height:size+14, borderRadius:12,
        background:`linear-gradient(135deg, ${BRAND.primary}, ${BRAND.purple})`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:size-2, flexShrink:0,
        boxShadow: `0 4px 14px ${BRAND.primary}45`
      }}>
        <FaBolt color="#fff" size={size-8} />
      </div>
      <span style={{ fontWeight:900, fontSize:size, color: isLightText ? '#fff' : '#1e293b', letterSpacing:'-0.5px' }}>
        GymLife <span style={{ color:BRAND.primary }}>Pro</span>
      </span>
    </div>
  );
}