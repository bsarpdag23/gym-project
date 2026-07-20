import React from 'react';
import { FaBolt } from 'react-icons/fa';

export const BRAND = { primary:'#e94560', dark:'#0f0f1a', dark2:'#1a1a2e', purple:'#533483' };

// ─── Ortak UI bileşenleri ─────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:5, fontSize:13, color:'#6b7280', fontWeight:600 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:9,
          fontSize:14, outline:'none', boxSizing:'border-box', background:'#fff', transition:'border .15s' }}
        onFocus={e => e.target.style.borderColor = BRAND.primary}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display:'block', marginBottom:5, fontSize:13, color:'#6b7280', fontWeight:600 }}>{label}</label>}
      <select
        value={value} onChange={onChange}
        style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:9,
          fontSize:14, background:'#fff', boxSizing:'border-box', outline:'none' }}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Btn({ children, onClick, color = BRAND.primary, outline, size = 'md', style = {} }) {
  const pad = size === 'sm' ? '6px 14px' : size === 'lg' ? '14px 32px' : '10px 22px';
  return (
    <button onClick={onClick} style={{
      padding: pad, fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14, fontWeight: 700, borderRadius: 9, cursor:'pointer',
      background: outline ? 'transparent' : color,
      border: `1.5px solid ${color}`,
      color: outline ? color : '#fff',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
      transition:'transform .12s, box-shadow .12s',
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {children}
    </button>
  );
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'#fff', borderRadius:14, padding:20,
      boxShadow:'0 2px 12px rgba(0,0,0,.07)', border:'1px solid #f0f0f0', ...style }}>
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
      background: src ? '#e5e7eb' : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.purple})`,
      color:'#fff', fontWeight:700, fontSize: size * 0.4,
    }}>
      {src
        ? <img src={src} alt={name || 'avatar'} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : (initials || '?')}
    </div>
  );
}

export function Badge({ label, color = BRAND.primary }) {
  return (
    <span style={{ background: color + '18', color, border:`1px solid ${color}33`,
      borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:600 }}>
      {label}
    </span>
  );
}

export function ProgressBar({ value, max = 100, color = BRAND.primary, label, height = 10 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12, color:'#6b7280' }}>
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div style={{ width:'100%', height, borderRadius: height, background:'#f3f4f6', overflow:'hidden' }}>
        <div style={{ width:`${percent}%`, height:'100%', borderRadius: height,
          background: color, transition:'width .3s ease' }} />
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex',
      alignItems:'center', justifyContent:'center', zIndex:999, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:460,
        boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22,
            cursor:'pointer', color:'#6b7280', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Logo({ light, size = 22 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <div style={{ width:size+14, height:size+14, borderRadius:11,
        background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:size-2, flexShrink:0 }}><FaBolt color="#fff" size={size-8} /></div>
      <span style={{ fontWeight:800, fontSize:size, color: light ? '#fff' : '#111827' }}>
        FitLife <span style={{ color:BRAND.primary }}>Pro</span>
      </span>
    </div>
  );
}