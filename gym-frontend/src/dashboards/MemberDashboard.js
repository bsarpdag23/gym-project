import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BRAND, Btn, Card, Badge, Input, Select, Logo } from '../components/ui';
import api from '../api';

// ─── Programım sekmesi (profil formu + program üretme/görüntüleme) ───
function MyProgramTab() {
  const [profile, setProfile]   = useState(null);
  const [program, setProgram]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [generating, setGen]    = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [err, setErr]           = useState('');
  const [form, setForm] = useState({
    heightCm:'', weightKg:'', age:'', gender:'male',
    targetWeightKg:'', weeklyWorkoutDays:'3', activityLevel:'moderate',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      const p = await api.healthProfile.getMine();
      setProfile(p);
      if (p) {
        setForm({
          heightCm: p.heightCm, weightKg: p.weightKg, age: p.age, gender: p.gender,
          targetWeightKg: p.targetWeightKg, weeklyWorkoutDays: p.weeklyWorkoutDays,
          activityLevel: p.activityLevel,
        });
        const active = await api.fitness.active();
        setProgram(active);
        const hist = await api.fitness.history();
        setHistory(hist);
      }
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    setErr(''); setSaving(true);
    try {
      const payload = {
        heightCm: +form.heightCm, weightKg: +form.weightKg, age: +form.age,
        gender: form.gender, targetWeightKg: +form.targetWeightKg,
        weeklyWorkoutDays: +form.weeklyWorkoutDays, activityLevel: form.activityLevel,
      };
      const saved = await api.healthProfile.save(payload);
      setProfile(saved);
      const active = await api.fitness.active();
      setProgram(active);
      const hist = await api.fitness.history();
      setHistory(hist);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const generate = async () => {
    setErr(''); setGen(true);
    try {
      const prog = await api.fitness.generate();
      setProgram(prog);
      const hist = await api.fitness.history();
      setHistory(hist);
    } catch (e) { setErr(e.message); }
    setGen(false);
  };

  if (loading) return <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>;

  const goalLabel = { gain:'Kilo Alma', lose:'Kilo Verme', maintain:'Koruma' };

  const daysLeft = program
    ? Math.ceil((new Date(program.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div>
      {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
        borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

      <Card style={{ marginBottom:20 }}>
        <h3 style={{ margin:'0 0 4px' }}>{profile ? '📋 Sağlık Bilgilerim' : '👋 Önce Bilgilerini Gir'}</h3>
        <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 18px' }}>
          {profile ? 'Bilgilerini güncelleyip programını yeniden oluşturabilirsin.' : 'Sana özel program için bu bilgiler gerekli.'}
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Boy (cm)"      value={form.heightCm}       onChange={set('heightCm')} type="number" placeholder="178" />
          <Input label="Kilo (kg)"     value={form.weightKg}       onChange={set('weightKg')} type="number" placeholder="70" />
          <Input label="Yaş"           value={form.age}            onChange={set('age')} type="number" placeholder="25" />
          <Input label="Hedef Kilo (kg)" value={form.targetWeightKg} onChange={set('targetWeightKg')} type="number" placeholder="75" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:4 }}>
          <Select label="Cinsiyet" value={form.gender} onChange={set('gender')}
            options={[
              { value:'male', label:'Erkek' },
              { value:'female', label:'Kadın' },
            ]} />
          <Select label="Haftalık Gün" value={form.weeklyWorkoutDays} onChange={set('weeklyWorkoutDays')}
            options={[1,2,3,4,5,6,7].map(n => ({ value:n, label:`${n} gün` }))} />
          <Select label="Aktivite" value={form.activityLevel} onChange={set('activityLevel')}
            options={[
              { value:'sedentary', label:'Hareketsiz' },
              { value:'light', label:'Hafif' },
              { value:'moderate', label:'Orta' },
              { value:'active', label:'Aktif' },
              { value:'very_active', label:'Çok Aktif' },
            ]} />
        </div>
        <Btn onClick={saveProfile} style={{ marginTop:16 }}>
          {saving ? 'Kaydediliyor...' : profile ? '💾 Bilgileri Güncelle' : '✓ Kaydet'}
        </Btn>
      </Card>

      {profile && (
        <Card style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h3 style={{ margin:'0 0 4px' }}>🎯 Antrenman & Diyet Programı</h3>
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>
              {program ? 'Yeni oluşturursan mevcut program geçmişe taşınır.' : 'Bilgilerine göre kişisel programını oluştur.'}
            </p>
          </div>
          <Btn onClick={generate} color="#8b5cf6">
            {generating ? 'Oluşturuluyor...' : program ? '🔄 Yeniden Oluştur' : '⚡ Program Oluştur'}
          </Btn>
        </Card>
      )}

      {program && (
        <>
          <Card style={{ marginBottom:16 }}>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <Badge label={goalLabel[program.goal] || program.goal} color="#8b5cf6" />
              <Badge label={`${program.startWeightKg} → ${program.targetWeightKg} kg`} color="#3b82f6" />
              <Badge label={`${program.durationWeeks} hafta`} color="#10b981" />
              <Badge label={`${program.startDate} → ${program.endDate}`} color="#6b7280" />
              <Badge label={`⏳ ${daysLeft} gün kaldı`} color="#e94560" />
            </div>
            {program.warnings && program.warnings.length > 0 && (
              <div style={{ marginBottom:16 }}>
                {program.warnings.map((w, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start',
                    background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10,
                    padding:'12px 14px', marginBottom:8 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
                    <span style={{ fontSize:13, color:'#92400e', lineHeight:1.5 }}>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
            <h4 style={{ margin:'0 0 12px' }}>🍎 Günlük Beslenme Hedefi</h4>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[
                ['Kalori', program.dailyCalories, 'kcal', '#e94560'],
                ['Protein', program.proteinG, 'g', '#3b82f6'],
                ['Karbonhidrat', program.carbsG, 'g', '#f59e0b'],
                ['Yağ', program.fatG, 'g', '#10b981'],
              ].map(([label, val, unit, c]) => (
                <div key={label} style={{ background:c+'10', border:`1px solid ${c}33`, borderRadius:10, padding:'14px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:800, color:c }}>{val}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>{label} ({unit})</div>
                </div>
              ))}
            </div>
          </Card>

          <h4 style={{ margin:'0 0 12px' }}>🏋️ Haftalık Antrenman Planı</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {program.workoutPlan.map((day) => (
              <Card key={day.day}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'#8b5cf6', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14 }}>
                    {day.day}
                  </div>
                  <h4 style={{ margin:0 }}>Gün {day.day} — {day.focus}</h4>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  {day.exercises.map((ex) => (
                    <div key={ex.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                      background:'#f8fafc', borderRadius:8, padding:'10px 14px' }}>
                      <div>
                        <span style={{ fontWeight:600, fontSize:14 }}>{ex.name}</span>
                        <span style={{ color:'#9ca3af', fontSize:12, marginLeft:8 }}>{ex.equipment}</span>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <Badge label={ex.muscleGroup} color="#f59e0b" />
                        <Badge label={`${ex.sets}×${ex.reps}`} color="#3b82f6" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <p style={{ color:'#9ca3af', fontSize:12, marginTop:16, textAlign:'center' }}>
            ⚠️ Bu program genel hesaplamalara dayanır. Sağlık durumunuza göre bir uzmana danışın.
          </p>

          {history.filter(h => !h.isActive).length > 0 && (
            <div style={{ marginTop:24 }}>
              <div
                onClick={() => setShowHistory(!showHistory)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  cursor:'pointer', padding:'12px 0' }}>
                <h4 style={{ margin:0 }}>
                  📚 Geçmiş Programlar ({history.filter(h => !h.isActive).length})
                </h4>
                <span style={{ color:'#8b5cf6', fontSize:13, fontWeight:600 }}>
                  {showHistory ? 'Gizle ▲' : 'Göster ▼'}
                </span>
              </div>

              {showHistory && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {history.filter(h => !h.isActive).map((h) => (
                    <Card key={h.id} style={{ background:'#fafafa' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <Badge label={goalLabel[h.goal] || h.goal} color="#8b5cf6" />
                          <Badge label={`${h.startWeightKg} → ${h.targetWeightKg} kg`} color="#3b82f6" />
                          <Badge label={`${h.durationWeeks} hafta`} color="#10b981" />
                        </div>
                        <div style={{ color:'#9ca3af', fontSize:12 }}>
                          {new Date(h.createdAt).toLocaleDateString('tr')} · {h.dailyCalories} kcal
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Member Dashboard ───
export default function MemberDashboard({ user, onLogout }) {
  const [tab, setTab]       = useState('plans');
  const [plans, setPlans]   = useState([]);
  const [mine, setMine]     = useState([]);
  const [progs, setProgs]   = useState([]);
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  const [me, setMe] = useState(null);

  const load = async () => {
    try {
      if (tab === 'plans') {
  const [allPlans, myEnrollments] = await Promise.all([
    api.plans.getAll(),
    api.enrollments.getMine(),
  ]);
  setPlans(allPlans.filter(p => p.isActive));
  // Aktif ve süresi geçmemiş üyeliği var mı?
  const now = new Date();
  const active = myEnrollments.some(e => e.status === 'active' && new Date(e.endDate) >= now);
  setHasActiveMembership(active);
}
      if (tab === 'mine')     setMine(await api.enrollments.getMine());
      if (tab === 'programs') setProgs(await api.programs.getAll());
      if (tab === 'qr') setMe(await api.users.getMe());
    } catch (e) { alert(e.message); }
  };
  useEffect(() => { load(); }, [tab]);

  const enroll = async (planId) => {
    try { await api.enrollments.create(planId); alert('Üyelik başarıyla oluşturuldu! 🎉'); load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
      <div style={{ background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`, padding:'14px 28px',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Logo light />
        <div style={{ display:'flex', gap:12, alignItems:'center', color:'#fff' }}>
          <span style={{ fontSize:14 }}>👤 {user.fullName}</span>
          <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {[
            { id:'plans',    label:'📦 Paketler' },
            { id:'mine',     label:'🎫 Üyeliklerim' },
            { id:'programs', label:'📋 Programlar' },
            { id:'myprogram', label:'🎯 Programım' },
            { id:'qr', label:'🧾 QR Kodum' }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'9px 22px', borderRadius:10, border:`2px solid ${tab===t.id?BRAND.primary:'#e5e7eb'}`,
              background: tab===t.id ? BRAND.primary : '#fff',
              color: tab===t.id ? '#fff' : '#374151',
              fontWeight:600, fontSize:14, cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'plans' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {plans.length === 0 && (
              <Card style={{ textAlign:'center', padding:40, gridColumn:'1 / -1' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
                <p style={{ color:'#6b7280', margin:0 }}>Şu anda satışta paket bulunmuyor.</p>
              </Card>
            )}
            
            {plans.map(p => (
              <Card key={p.id} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <h3 style={{ margin:0 }}>{p.name}</h3>
                <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>{p.description}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f0f0f0', paddingTop:12 }}>
                  <Badge label={`${p.durationMonths} Ay`} color="#3b82f6" />
                  <span style={{ fontSize:24, fontWeight:800, color:BRAND.primary }}>{p.price} ₺</span>
                </div>
                {hasActiveMembership ? (
  <div style={{ textAlign:'center', padding:'10px', background:'#f0fdf4', border:'1px solid #86efac',
    borderRadius:9, color:'#16a34a', fontSize:13, fontWeight:600 }}>
    ✓ Zaten aktif üyeliğiniz var
  </div>
) : (
  <Btn onClick={() => enroll(p.id)} style={{ width:'100%', justifyContent:'center' }}>
    🎯 Üye Ol
  </Btn>
)}
              </Card>
            ))}
          </div>
        )}

        {tab === 'mine' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mine.length === 0 && (
              <Card style={{ textAlign:'center', padding:40 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🎫</div>
                <p style={{ color:'#6b7280', margin:0 }}>Henüz üyeliğiniz bulunmuyor.</p>
              </Card>
            )}
            {mine.map(e => (
              <Card key={e.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <h4 style={{ margin:'0 0 4px' }}>{e.plan?.name}</h4>
                  <div style={{ color:'#6b7280', fontSize:13 }}>
                    {new Date(e.startDate).toLocaleDateString('tr')} → {new Date(e.endDate).toLocaleDateString('tr')}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#10b981' }}>{e.amountPaid} ₺</div>
                  <Badge label={e.status === 'active' ? 'Aktif' : 'Pasif'} color={e.status === 'active' ? '#10b981' : '#6b7280'} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'programs' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {plans.length === 0 && (
              <Card style={{ textAlign:'center', padding:40, gridColumn:'1 / -1' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
                <p style={{ color:'#6b7280', margin:0 }}>Şu anda satışta paket bulunmuyor.</p>
              </Card>
            )}
            
            {progs.map(p => (
              <Card key={p.id}>
                <h3 style={{ margin:'0 0 6px' }}>{p.name}</h3>
                <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 12px' }}>{p.description}</p>
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <Badge label={p.difficulty} color="#8b5cf6" />
                  <Badge label={`${p.weeksCount} Hafta`} color="#10b981" />
                  <Badge label={`${(p.exercises||[]).length} Egzersiz`} color="#f59e0b" />
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  {(p.exercises || []).map(e => (
                    <div key={e.id} style={{ display:'flex', justifyContent:'space-between',
                      background:'#f8fafc', borderRadius:8, padding:'10px 14px', fontSize:14 }}>
                      <span style={{ fontWeight:500 }}>{e.name}</span>
                      <div style={{ display:'flex', gap:8 }}>
                        <Badge label={e.category} color="#f59e0b" />
                        <Badge label={`${e.sets}×${e.reps}`} color="#3b82f6" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'myprogram' && <MyProgramTab />}

        {tab === 'qr' && (
          <div style={{ display:'flex', justifyContent:'center' }}>
            <Card style={{ maxWidth:380, width:'100%', textAlign:'center', padding:32 }}>
              <h3 style={{ margin:'0 0 6px' }}>📱 Giriş QR Kodum</h3>
              <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 24px' }}>
                Salona girerken bu kodu görevliye okutun.
              </p>
              {me?.qrToken ? (
                <>
                  <div style={{ display:'inline-block', padding:20, background:'#fff',
                    borderRadius:16, border:'1px solid #f0f0f0', boxShadow:'0 4px 16px rgba(0,0,0,.06)' }}>
                    <QRCodeSVG value={me.qrToken} size={200} level="M" />
                  </div>
                  <div style={{ marginTop:20 }}>
                    <div style={{ fontWeight:700, fontSize:16 }}>{me.fullName}</div>
                    <div style={{ color:'#9ca3af', fontSize:12, marginTop:4 }}>Üye No: {me.id}</div>
                  </div>
                </>
              ) : (
                <p style={{ color:'#9ca3af' }}>QR kodunuz yükleniyor...</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}