import React from 'react';
import { FaBolt } from 'react-icons/fa';

export const BRAND = {
  primary: '#e94560',       // Original Burgundy/Mürdüm
  primaryHover: '#d2334e',
  dark: '#0a0e17',          // Matte dark background
  dark2: '#111827',         // Slate 900
  purple: '#533483',        // Original Purple
  accent: '#e94560'
};

// ─── Ortak UI bileşenleri ─────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:6, fontSize:13, color:'#9ca3af', fontWeight:600 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width:'100%', padding:'12px 16px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12,
          fontSize:14, outline:'none', boxSizing:'border-box', background:'#111827', color:'#f3f4f6',
          transition:'border-color .15s, box-shadow .15s'
        }}
        onFocus={e => {
          e.target.style.borderColor = BRAND.primary;
          e.target.style.boxShadow = `0 0 0 3px ${BRAND.primary}20`;
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.08)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:6, fontSize:13, color:'#9ca3af', fontWeight:600 }}>{label}</label>}
      <select
        value={value} onChange={onChange}
        style={{
          width:'100%', padding:'12px 16px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12,
          fontSize:14, background:'#111827', color:'#f3f4f6', boxSizing:'border-box', outline:'none',
          transition:'border-color .15s'
        }}
        onFocus={e => e.target.style.borderColor = BRAND.primary}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background:'#111827', color:'#f3f4f6' }}>{opt.label}</option>
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
      if (!outline) e.currentTarget.style.boxShadow = `0 6px 20px ${color}45`;
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
  return (
    <div onClick={onClick} style={{
      background:'#111827', borderRadius:16, padding:22,
      border:'1px solid rgba(255,255,255,0.06)',
      boxShadow:'0 10px 30px rgba(0,0,0,0.3)',
      transition:'transform .15s, border-color .15s',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
    onMouseEnter={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
      }
    }}
    onMouseLeave={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
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
      background: src ? '#1f2937' : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.purple})`,
      color:'#fff', fontWeight:700, fontSize: size * 0.38,
      border: '1.5px solid rgba(255,255,255,0.15)'
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
      background: color + '15', color, border:`1px solid ${color}35`,
      borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:600,
      display:'inline-flex', alignItems:'center', gap:4
    }}>
      {label}
    </span>
  );
}

export function ProgressBar({ value, max = 100, color = BRAND.primary, label, height = 10 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12, color:'#9ca3af' }}>
          <span>{label}</span>
          <span style={{ fontWeight:700 }}>{value}/{max}</span>
        </div>
      )}
      <div style={{ width:'100%', height, borderRadius: height, background:'#1f2937', overflow:'hidden' }}>
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
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(5, 7, 12, 0.8)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16
    }}>
      <div style={{
        background:'#111827', borderRadius:20, padding:32, width:'100%', maxWidth:460,
        boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.5)', border:'1px solid rgba(255,255,255,0.08)',
        animation:'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)', color:'#f3f4f6'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:'#f3f4f6' }}>{title}</h3>
          <button onClick={onClose} style={{
            background:'none', border:'none', fontSize:26,
            cursor:'pointer', color:'#9ca3af', lineHeight:1, transition:'color .15s'
          }}
          onMouseEnter={e => e.target.style.color = '#f3f4f6'}
          onMouseLeave={e => e.target.style.color = '#9ca3af'}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Logo({ light, size = 22 }) {
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
      <span style={{ fontWeight:900, fontSize:size, color:'#fff', letterSpacing:'-0.5px' }}>
        FitLife <span style={{ color:BRAND.primary }}>Pro</span>
      </span>
    </div>
  );
}