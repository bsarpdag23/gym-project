import React from 'react';
import { BRAND, Btn, Card, Badge, Logo } from '../components/ui';

export default function LandingPage({ goLogin, goRegister }) {
  const features = [
    { icon:'👥', title:'Üye Yönetimi', desc:'Üyelerinizi, paketlerinizi ve üyelik sürelerini tek panelden yönetin.' },
    { icon:'🏋️', title:'Egzersiz Kütüphanesi', desc:'Sınırsız egzersiz ekleyin, kategorilere ayırın, antrenörlerinize özel yetkiler verin.' },
    { icon:'📋', title:'Antrenman Programları', desc:'Egzersizleri programlara bağlayın, üyelerinize özel rutinler oluşturun.' },
    { icon:'🔐', title:'Rol Tabanlı Erişim', desc:'Admin, Trainer ve Üye rolleriyle herkesin yalnızca yetkili olduğu alanı görmesini sağlayın.' },
    { icon:'📊', title:'Gerçek Zamanlı Takip', desc:'Üyelik durumlarını, ödemeleri ve doluluk oranlarını anlık görüntüleyin.' },
    { icon:'☁️', title:'Bulut Tabanlı', desc:'Hiçbir kurulum derdi yok. Her cihazdan, her yerden erişim.' },
  ];

  const plans = [
    { name:'Başlangıç', price:'₺499', period:'/ay', features:['50 üyeye kadar','1 Admin hesabı','Temel raporlama','Email destek'], highlight:false },
    { name:'Profesyonel', price:'₺999', period:'/ay', features:['250 üyeye kadar','5 Trainer hesabı','Gelişmiş raporlama','Öncelikli destek','Özel marka'], highlight:true },
    { name:'Kurumsal', price:'Özel', period:'', features:['Sınırsız üye','Sınırsız personel','API erişimi','Özel entegrasyon','7/24 destek'], highlight:false },
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
          <Badge label="🚀 Spor Salonları İçin Yeni Nesil Yönetim" color="#fff" />
          <h1 style={{ color:'#fff', fontSize:48, fontWeight:800, lineHeight:1.2, margin:'22px 0 18px' }}>
            Spor Salonunuzu <span style={{ color:BRAND.primary }}>Tek Panelden</span> Yönetin
          </h1>
          <p style={{ color:'#aab2c8', fontSize:17, lineHeight:1.7, maxWidth:560, margin:'0 auto 34px' }}>
            Üyelik takibi, antrenman programları ve egzersiz kütüphanesi — hepsi tek platformda.
            Kurulum yok, donanım yok, sadece sonuç.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Btn onClick={goRegister} size="lg">⚡ Ücretsiz Dene</Btn>
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
              <div style={{ fontSize:32, marginBottom:14 }}>{f.icon}</div>
              <h3 style={{ margin:'0 0 8px', fontSize:17 }}>{f.title}</h3>
              <p style={{ color:'#6b7280', fontSize:14, lineHeight:1.6, margin:0 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
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
                <div style={{ margin:'14px 0 20px' }}>
                  <span style={{ fontSize:34, fontWeight:800 }}>{p.price}</span>
                  <span style={{ color:'#6b7280', fontSize:14 }}>{p.period}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:'flex', gap:8, fontSize:14, color:'#374151' }}>
                      <span style={{ color:BRAND.primary }}>✓</span>{f}
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
          🚀 Hemen Başla
        </Btn>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:BRAND.dark, padding:'36px 24px', textAlign:'center' }}>
        <Logo light />
        <p style={{ color:'#8892a4', fontSize:13, marginTop:14 }}>© 2026 FitLife Pro — Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}