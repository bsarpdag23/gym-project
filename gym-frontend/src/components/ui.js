import React from 'react';
import { FaBolt, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

// Core BRAND export (Light mode default values retained for backwards compatibility)
export const BRAND = {
  primary: '#e94560',       // Original Burgundy/Mürdüm
  primaryHover: '#d2334e',
  dark: '#0a0e17',          // Matte dark background
  dark2: '#111827',         // Slate 900
  purple: '#533483',        // Original Purple
  accent: '#e94560',
  pink: '#ec4899',

  // Dark Neon Vibrant Palette
  neonCyan: '#00f2fe',
  neonCyanAlt: '#06b6d4',
  neonPurple: '#a855f7',
  neonPink: '#ec4899'
};

export function getThemeBrand(isDark) {
  if (isDark) {
    return {
      primary: '#00f2fe',
      primaryAlt: '#06b6d4',
      primaryHover: '#0891b2',
      purple: '#a855f7',
      accent: '#00f2fe',
      pink: '#ec4899',
      bgCard: 'rgba(16, 23, 38, 0.85)',
      borderCard: '1px solid rgba(6, 182, 212, 0.22)',
      shadowCard: '0 8px 32px rgba(6, 182, 212, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
    };
  }
  return {
    primary: '#e94560',
    primaryAlt: '#e94560',
    primaryHover: '#d2334e',
    purple: '#533483',
    accent: '#e94560',
    pink: '#ec4899',
    bgCard: '#ffffff',
    borderCard: '1px solid #f1f5f9',
    shadowCard: '0 8px 30px rgba(0,0,0,0.04)'
  };
}

export function ThemeToggleBtn() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
      style={{
        background: isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(233, 69, 96, 0.08)',
        border: isDark ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(233, 69, 96, 0.2)',
        color: isDark ? '#00f2fe' : '#e94560',
        borderRadius: 12,
        padding: '8px 14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 13,
        transition: 'all 0.2s ease',
        boxShadow: isDark ? '0 0 14px rgba(6, 182, 212, 0.25)' : '0 2px 8px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = isDark ? '0 0 20px rgba(6, 182, 212, 0.4)' : '0 4px 12px rgba(233,69,96,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isDark ? '0 0 14px rgba(6, 182, 212, 0.25)' : '0 2px 8px rgba(0,0,0,0.05)';
      }}
    >
      {isDark ? <FaSun size={15} color="#00f2fe" /> : <FaMoon size={15} color="#533483" />}
      <span>{isDark ? 'Aydınlık' : 'Karanlık'}</span>
    </button>
  );
}

// ─── Ortak UI bileşenleri ─────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = 'text', placeholder }) {
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:6, fontSize:13, color: isDark ? '#94a3b8' : '#475569', fontWeight:600 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width:'100%', padding:'12px 16px',
          border: isDark ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid #e2e8f0',
          borderRadius:12, fontSize:14, outline:'none', boxSizing:'border-box',
          background: isDark ? '#0b1120' : '#fff',
          color: isDark ? '#f8fafc' : '#1e293b',
          transition:'border-color .15s, box-shadow .15s'
        }}
        onFocus={e => {
          e.target.style.borderColor = themeBrand.primary;
          e.target.style.boxShadow = isDark ? '0 0 14px rgba(6, 182, 212, 0.35)' : `0 0 0 3px ${themeBrand.primary}25`;
        }}
        onBlur={e => {
          e.target.style.borderColor = isDark ? 'rgba(6, 182, 212, 0.3)' : '#e2e8f0';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:6, fontSize:13, color: isDark ? '#94a3b8' : '#475569', fontWeight:600 }}>{label}</label>}
      <select
        value={value} onChange={onChange}
        style={{
          width:'100%', padding:'12px 16px',
          border: isDark ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid #e2e8f0',
          borderRadius:12, fontSize:14,
          background: isDark ? '#0b1120' : '#fff',
          color: isDark ? '#f8fafc' : '#1e293b',
          boxSizing:'border-box', outline:'none',
          transition:'border-color .15s'
        }}
        onFocus={e => e.target.style.borderColor = themeBrand.primary}
        onBlur={e => e.target.style.borderColor = isDark ? 'rgba(6, 182, 212, 0.3)' : '#e2e8f0'}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: isDark ? '#0b1120' : '#fff', color: isDark ? '#f8fafc' : '#1e293b' }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Btn({ children, onClick, color, outline, size = 'md', style = {} }) {
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);
  
  const activeColor = color || themeBrand.primary;
  const pad = size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 36px' : '11px 24px';
  const radius = 12;
  const isCustomColor = Boolean(color);

  const defaultGradient = isDark
    ? `linear-gradient(135deg, ${themeBrand.primary}, ${themeBrand.purple})`
    : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.purple})`;

  return (
    <button onClick={onClick} style={{
      padding: pad, fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14, fontWeight: 700, borderRadius: radius, cursor:'pointer',
      background: outline ? 'transparent' : (isCustomColor ? color : defaultGradient),
      border: outline ? `1.5px solid ${activeColor}` : 'none',
      color: outline ? activeColor : (isDark ? '#090d16' : '#fff'),
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
      boxShadow: outline ? 'none' : (isDark ? `0 4px 20px ${themeBrand.primary}50` : `0 4px 14px ${activeColor}30`),
      transition:'transform .15s, box-shadow .15s, opacity .15s',
      ...style,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-1.5px)';
      if (!outline) {
        e.currentTarget.style.boxShadow = isDark
          ? `0 6px 24px ${themeBrand.primary}70`
          : `0 6px 20px ${activeColor}40`;
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      if (!outline) {
        e.currentTarget.style.boxShadow = isDark
          ? `0 4px 20px ${themeBrand.primary}50`
          : `0 4px 14px ${activeColor}30`;
      }
    }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style = {}, onClick }) {
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);

  return (
    <div onClick={onClick} style={{
      background: themeBrand.bgCard,
      backdropFilter: isDark ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: isDark ? 'blur(16px)' : 'none',
      borderRadius: 16, padding: 22,
      border: themeBrand.borderCard,
      boxShadow: themeBrand.shadowCard,
      color: isDark ? '#f8fafc' : '#1e293b',
      transition: 'transform .15s, border-color .2s, background-color .2s, box-shadow .2s',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
    onMouseEnter={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = themeBrand.primary;
        if (isDark) {
          e.currentTarget.style.boxShadow = '0 12px 36px rgba(6, 182, 212, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)';
        }
      }
    }}
    onMouseLeave={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(6, 182, 212, 0.22)' : '#f1f5f9';
        if (isDark) {
          e.currentTarget.style.boxShadow = themeBrand.shadowCard;
        }
      }
    }}
    >
      {children}
    </div>
  );
}

export function Avatar({ src, name, size = 36 }) {
  const initials = (name || '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);

  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      background: src ? (isDark ? '#0f172a' : '#f1f5f9') : `linear-gradient(135deg, ${themeBrand.primary}, ${themeBrand.purple})`,
      color: isDark ? '#090d16' : '#fff',
      fontWeight:700, fontSize: size * 0.38,
      border: isDark ? '1.5px solid rgba(6, 182, 212, 0.4)' : '1.5px solid rgba(255,255,255,0.2)'
    }}>
      {src
        ? <img src={src} alt={name || 'avatar'} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : (initials || '?')}
    </div>
  );
}

export function Badge({ label, color }) {
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);
  const badgeColor = color || themeBrand.primary;

  return (
    <span style={{
      background: isDark ? `${badgeColor}22` : `${badgeColor}12`,
      color: badgeColor,
      border: isDark ? `1px solid ${badgeColor}45` : `1px solid ${badgeColor}30`,
      borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700,
      display:'inline-flex', alignItems:'center', gap:4,
      boxShadow: isDark ? `0 0 10px ${badgeColor}25` : 'none'
    }}>
      {label}
    </span>
  );
}

export function ProgressBar({ value, max = 100, color, label, height = 10 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);
  const barColor = color || themeBrand.primary;

  return (
    <div>
      {label && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12, color: isDark ? '#94a3b8' : '#64748b' }}>
          <span>{label}</span>
          <span style={{ fontWeight:700, color: isDark ? '#f8fafc' : '#1e293b' }}>{value}/{max}</span>
        </div>
      )}
      <div style={{ width:'100%', height, borderRadius: height, background: isDark ? '#0b1120' : '#e2e8f0', border: isDark ? '1px solid rgba(6, 182, 212, 0.2)' : 'none', overflow:'hidden' }}>
        <div style={{
          width:`${percent}%`, height:'100%', borderRadius: height,
          background: `linear-gradient(90deg, ${barColor}, ${themeBrand.purple})`,
          boxShadow: isDark ? `0 0 12px ${barColor}` : 'none',
          transition:'width .4s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);

  return (
    <div style={{
      position:'fixed', inset:0, background: isDark ? 'rgba(5, 8, 15, 0.8)' : 'rgba(15, 23, 42, 0.45)',
      backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16
    }}>
      <div style={{
        background: themeBrand.bgCard,
        borderRadius:20, padding:32, width:'100%', maxWidth:460,
        boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.2)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        border: themeBrand.borderCard,
        animation:'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: isDark ? '#f8fafc' : '#1e293b'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color: isDark ? '#f8fafc' : '#1e293b' }}>{title}</h3>
          <button onClick={onClose} style={{
            background:'none', border:'none', fontSize:26,
            cursor:'pointer', color: isDark ? '#94a3b8' : '#64748b', lineHeight:1, transition:'color .15s'
          }}
          onMouseEnter={e => e.target.style.color = isDark ? '#00f2fe' : '#1e293b'}
          onMouseLeave={e => e.target.style.color = isDark ? '#94a3b8' : '#64748b'}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Logo({ light, size = 22 }) {
  const { isDark } = useTheme() || { isDark: false };
  const themeBrand = getThemeBrand(isDark);
  const isLightText = light !== undefined ? light : isDark;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{
        width:size+14, height:size+14, borderRadius:12,
        background:`linear-gradient(135deg, ${themeBrand.primary}, ${themeBrand.purple})`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:size-2, flexShrink:0,
        boxShadow: isDark ? `0 0 16px ${themeBrand.primary}80` : `0 4px 14px ${BRAND.primary}45`
      }}>
        <FaBolt color={isDark ? '#090d16' : '#fff'} size={size-8} />
      </div>
      <span style={{ fontWeight:900, fontSize:size, color: isLightText ? '#fff' : '#1e293b', letterSpacing:'-0.5px' }}>
        GymLife <span style={{ color: themeBrand.primary, textShadow: isDark ? '0 0 12px rgba(6, 182, 212, 0.5)' : 'none' }}>Pro</span>
      </span>
    </div>
  );
}