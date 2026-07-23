import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaDumbbell, FaClipboardList, FaLock, FaChartBar, FaCloud, FaRocket, FaBolt, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';
import { BRAND, Btn, Card, Badge, Logo } from '../components/ui';
import api from '../api';

export default function LandingPage({ goLogin, goRegister }) {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.gyms.getPublicList();
        setGyms(list || []);
      } catch (e) {
        console.error('Salonlar yuklenemedi', e);
      }
    })();
  }, []);

  const features = [
    { icon:<FaUsers/>, title:'Üye Yönetimi', desc:'Üyelerinizi, paketlerinizi ve üyelik sürelerini tek panelden yönetin.' },
    { icon:<FaDumbbell/>, title:'Egzersiz Kütüphanesi', desc:'Sınırsız egzersiz ekleyin, kategorilere ayırın, antrenörlerinize özel yetkiler verin.' },
    { icon:<FaClipboardList/>, title:'Antrenman Programları', desc:'Egzersizleri programlara bağlayın, üyelerinize özel rutinler oluşturun.' },
    { icon:<FaLock/>, title:'Rol Tabanlı Erişim', desc:'Admin, Trainer ve Üye rolleriyle herkesin yalnızca yetkili olduğu alanı görmesini sağlayın.' },
    { icon:<FaChartBar/>, title:'Gerçek Zamanlı Takip', desc:'Üyelik durumlarını, ödemeleri ve doluluk oranlarını anlık görüntüleyin.' },
    { icon:<FaCloud/>, title:'Bulut Tabanlı', desc:'Hiçbir kurulum derdi yok. Her cihazdan, her yerden erişim.' },
  ];

  const plans = [
    { 
      name: 'Başlangıç', 
      price: '₺749', 
      originalPrice: '₺1.499',
      period: '/ay', 
      features: ['100 üyeye kadar', '1 Admin hesabı', 'Temel metrikler & QR giriş', 'Haftalık yedekleme', 'Email destek'], 
      highlight: false 
    },
    { 
      name: 'Profesyonel', 
      price: '₺1.399', 
      originalPrice: '₺2.999',
      period: '/ay', 
      features: ['500 üyeye kadar', 'Sınırsız Trainer hesabı', 'Üye Kayıp Önleme (Retention) Modülü', 'AI Diyet Modülü Entegrasyonu', 'Gelişmiş Gelir Analizi & Raporlama', 'Öncelikli Destek'], 
      highlight: true 
    },
    { 
      name: 'Kurumsal', 
      price: '₺2.899', 
      originalPrice: '₺5.999',
      period: '/ay', 
      features: ['Sınırsız üye & şube', 'Çoklu Şube Yönetimi', 'Sanal POS Entegrasyonu', 'Özel Domain/Microsite Desteği', 'Turnike & Donanım Entegrasyonu', '7/24 Telefon Desteği'], 
      highlight: false 
    },
  ];

  return (
    <div style={{ fontFamily:'Segoe UI,sans-serif', color:'#111827' }}>
      {/* ── NAVBAR ── */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,.85)',
        backdropFilter:'blur(10px)', borderBottom:'1px solid #f0f0f0' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'14px 24px',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Logo />
          <div style={{ display:'flex', gap:32, alignItems:'center' }}>
            <a href="#features" style={{ color:'#374151', textDecoration:'none', fontSize:14, fontWeight:600 }}>Özellikler</a>
            <a href="#gyms" style={{ color:'#374151', textDecoration:'none', fontSize:14, fontWeight:600 }}>Spor Salonları</a>
            <a href="#pricing"  style={{ color:'#374151', textDecoration:'none', fontSize:14, fontWeight:600 }}>Fiyatlandırma</a>
            <Btn onClick={goLogin} color="#374151" outline size="sm">Giriş Yap</Btn>
            <Btn onClick={goRegister} size="sm">Ücretsiz Başla</Btn>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{ background:`linear-gradient(160deg,${BRAND.dark},${BRAND.dark2} 60%)`,
        padding:'90px 24px 110px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%',
          background:`radial-gradient(circle,${BRAND.primary}33,transparent 70%)` }} />
        <div style={{ position:'absolute', bottom:-150, left:-100, width:400, height:400, borderRadius:'50%',
          background:`radial-gradient(circle,${BRAND.purple}33,transparent 70%)` }} />
        <div style={{ position:'relative', maxWidth:780, margin:'0 auto' }}>
          <Badge label={<><FaRocket/> Spor Salonları İçin Yeni Nesil Yönetim</>} color="#fff" />
          <h1 style={{ color:'#fff', fontSize:48, fontWeight:800, lineHeight:1.2, margin:'22px 0 18px' }}>
            Spor Salonunuzu <span style={{ color:BRAND.primary }}>Tek Panelden</span> Yönetin
          </h1>
          <p style={{ color:'#aab2c8', fontSize:17, lineHeight:1.7, maxWidth:560, margin:'0 auto 34px' }}>
            Üyelik takibi, antrenman programları ve egzersiz kütüphanesi — hepsi tek platformda.
            Kurulum yok, donanım yok, sadece sonuç.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Btn onClick={goRegister} size="lg"><FaBolt/> Ücretsiz Dene</Btn>
            <Btn onClick={goLogin} size="lg" color="#fff" outline>Giriş Yap</Btn>
          </div>
          <div style={{ display:'flex', gap:40, justifyContent:'center', marginTop:56, flexWrap:'wrap' }}>
            {[['500+','Spor Salonu'],['25K+','Aktif Üye'],['99.9%','Çalışma Süresi']].map(([n,l]) => (
              <div key={l}>
                <div style={{ color:'#fff', fontSize:28, fontWeight:800 }}>{n}</div>
                <div style={{ color:'#8892a4', fontSize:13 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ÖZELLİKLER ── */}
      <div id="features" style={{ maxWidth:1180, margin:'0 auto', padding:'90px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:54 }}>
          <Badge label="ÖZELLİKLER" />
          <h2 style={{ fontSize:34, fontWeight:800, margin:'14px 0 12px' }}>Her Şey Tek Bir Yerde</h2>
          <p style={{ color:'#6b7280', fontSize:15 }}>İhtiyacınız olan her araç, modern ve kolay kullanımlı arayüzde.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {features.map(f => (
            <Card key={f.title} style={{ transition:'transform .15s' }}>
              <div style={{ fontSize:32, marginBottom:14, color:BRAND.primary }}>{f.icon}</div>
              <h3 style={{ margin:'0 0 8px', fontSize:17 }}>{f.title}</h3>
              <p style={{ color:'#6b7280', fontSize:14, lineHeight:1.6, margin:0 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── SPOR SALONLARIMIZ ── */}
      <div id="gyms" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 90px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Badge label="ANLAŞMALI SALONLARIMIZ" />
          <h2 style={{ fontSize: 34, fontWeight: 800, margin: '14px 0 12px' }}>Anlaşmalı Spor Salonlarımız</h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Size en yakın salonu seçin, paketlerini inceleyin ve anında kaydolun.</p>
        </div>

        {gyms.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: 14 }}>Sistemimizde şu an kayıtlı aktif salon bulunmamaktadır.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {gyms.map(g => (
              <Card key={g.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700 }}>{g.name}</h3>
                  <div style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <FaMapMarkerAlt /> {g.address || 'Adres belirtilmemiş.'}
                  </div>
                </div>
                <Btn onClick={() => navigate(`/gym/${g.id}`)} style={{ width: '100%', justifyContent: 'center' }}>
                  Salonu İncele & Kaydol →
                </Btn>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── FİYATLANDIRMA ── */}
      <div id="pricing" style={{ background:'#f8fafc', padding:'90px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:54 }}>
            <Badge label="FİYATLANDIRMA" />
            <h2 style={{ fontSize:34, fontWeight:800, margin:'14px 0 12px' }}>Size Uygun Planı Seçin</h2>
            <p style={{ color:'#6b7280', fontSize:15 }}>Gizli ücret yok, istediğiniz zaman iptal edin.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:22 }}>
            {plans.map(p => (
              <Card key={p.name} style={{
                border: p.highlight ? `2.5px solid ${BRAND.primary}` : '1px solid #f0f0f0',
                position:'relative', transform: p.highlight ? 'scale(1.04)' : 'none',
                boxShadow: p.highlight ? `0 12px 30px ${BRAND.primary}33` : '0 2px 12px rgba(0,0,0,.07)',
              }}>
                {p.highlight && (
                  <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)' }}>
                    <Badge label="EN POPÜLER" />
                  </div>
                )}
                <h3 style={{ margin:'8px 0 6px' }}>{p.name}</h3>
                <div style={{ margin:'14px 0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>
                    {p.originalPrice}
                  </div>
                  <div>
                    <span style={{ fontSize:34, fontWeight:800, color: BRAND.primary }}>{p.price}</span>
                    <span style={{ color:'#6b7280', fontSize:14 }}>{p.period}</span>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:'flex', gap:8, fontSize:14, color:'#374151' }}>
                      <span style={{ color:BRAND.primary }}><FaCheck/></span>{f}
                    </div>
                  ))}
                </div>
                <Btn onClick={goRegister} style={{ width:'100%', justifyContent:'center' }}
                  color={p.highlight ? BRAND.primary : '#374151'} outline={!p.highlight}>
                  Başla
                </Btn>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`,
        padding:'70px 24px', textAlign:'center' }}>
        <h2 style={{ color:'#fff', fontSize:30, fontWeight:800, margin:'0 0 14px' }}>
          Spor Salonunuzu Dijitalleştirmeye Hazır mısınız?
        </h2>
        <p style={{ color:'#ffffffcc', marginBottom:28 }}>Kredi kartı gerekmez. 14 gün ücretsiz deneme.</p>
        <Btn onClick={goRegister} size="lg" color="#fff" style={{ color:BRAND.primary, background:'#fff' }}>
          <FaRocket/> Hemen Başla
        </Btn>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:BRAND.dark, padding:'36px 24px', textAlign:'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Logo light />
        <p style={{ color:'#8892a4', fontSize:14, margin: '6px 0 0' }}>
          Destek ve İletişim: <a href="mailto:sarpdag1907@gmail.com" style={{ color: BRAND.primary, textDecoration: 'none', fontWeight: 600 }}>sarpdag1907@gmail.com</a>
        </p>
        <p style={{ color:'#64748b', fontSize:12, margin: 0 }}>© 2026 FitLife Pro — Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}