import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaArrowLeft, FaDumbbell, FaUsers, FaClock } from 'react-icons/fa';
import { BRAND, Btn, Card, Badge, Logo } from '../components/ui';
import api from '../api';

export default function GymDetailPage() {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.gyms.getPublicDetail(gymId);
        setData(res);
      } catch (err) {
        setError(err.message || 'Salon bilgileri yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    })();
  }, [gymId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Segoe UI,sans-serif' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#4b5563' }}>Salon bilgileri yükleniyor...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Segoe UI,sans-serif', gap: 16 }}>
        <div style={{ fontSize: 48 }}>😞</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>Salon Bulunamadı</div>
        <div style={{ color: '#6b7280' }}>{error || 'Aradığınız spor salonu bulunamadı veya pasif durumda.'}</div>
        <Btn onClick={() => navigate('/')} outline><FaArrowLeft /> Ana Sayfaya Dön</Btn>
      </div>
    );
  }

  const { gym, plans } = data;

  const highlights = [
    { icon: <FaDumbbell />, title: 'Modern Ekipmanlar', desc: 'Son teknoloji kardiyo ve ağırlık makine parkuru.' },
    { icon: <FaUsers />, title: 'Uzman Antrenörler', desc: 'Hedeflerinize ulaşmanızda yardımcı olacak profesyonel ekip.' },
    { icon: <FaClock />, title: 'Esnek Saatler', desc: 'Gününüzü planlamanıza uygun, konforlu çalışma saatleri.' },
  ];

  return (
    <div style={{ fontFamily: 'Segoe UI,sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#1f2937' }}>
      
      {/* ── NAVBAR ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Btn onClick={() => navigate('/')} outline size="sm" style={{ padding: '6px 10px' }}>
              <FaArrowLeft />
            </Btn>
            <Logo />
          </div>
          <Btn onClick={() => navigate('/login')} size="sm">Giriş Yap</Btn>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.purple})`, color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Badge label="ÜYE KAYIT NOKTASI" color="#ffffffcc" style={{ color: BRAND.primary, fontWeight: 700 }} />
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '16px 0 10px' }}>{gym.name}</h1>
          <p style={{ fontSize: 16, color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 0 8px' }}>
            <FaMapMarkerAlt /> {gym.address}
          </p>
          {gym.phone && (
            <p style={{ fontSize: 15, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 0 }}>
              <FaPhone /> {gym.phone}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* ── SALON HIGHLIGHTS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 40 }}>
          {highlights.map((h, i) => (
            <Card key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ fontSize: 28, color: BRAND.primary }}>{h.icon}</div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>{h.title}</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{h.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* ── MEMBERSHIP PLANS ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Üyelik Paketlerimiz</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Size en uygun paketi seçerek hemen kaydolun ve spor yapmaya başlayın.</p>
        </div>

        {plans.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: '#6b7280', margin: 0 }}>Bu salona ait aktif bir üyelik paketi bulunmamaktadır.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 20 }}>
            {plans.map(p => (
              <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{p.name}</h3>
                  <p style={{ color: '#64748b', fontSize: 13, minHeight: 40, lineHeight: 1.5, margin: '0 0 16px' }}>{p.description || 'Açıklama belirtilmemiş.'}</p>
                  
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    <Badge label={`${p.durationMonths} Ay`} color="#3b82f6" />
                    {p.includesPersonalTraining && (
                      <Badge label={p.ptSessionsCount > 0 ? `PT (${p.ptSessionsCount} Seans)` : 'PT Dahil'} color="#8b5cf6" />
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Toplam Tutar</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: BRAND.primary }}>{p.price} ₺</span>
                  </div>
                  <Btn 
                    onClick={() => navigate(`/register?gymId=${gym.id}&planId=${p.id}`)}
                    style={{ width: '100%', justifyContent: 'center', background: BRAND.primary, borderColor: BRAND.primary }}
                  >
                    Hemen Kayıt Ol
                  </Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: '#0f172a', padding: '30px 20px', color: '#94a3b8', textAlign: 'center', marginTop: 60, borderTop: '1px solid #1e293b' }}>
        <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: 15 }}>{gym.name}</h4>
        <p style={{ fontSize: 12, margin: '0 0 12px' }}>{gym.address}</p>
        <p style={{ fontSize: 11, margin: 0 }}>© 2026 FitLife Pro — Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}
