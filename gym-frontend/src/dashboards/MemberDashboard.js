import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  FaClipboardList, FaInfoCircle, FaSave, FaCheck, FaBullseye, FaSyncAlt, FaBolt,
  FaAppleAlt, FaUser, FaHourglassHalf, FaExclamationTriangle, FaDumbbell, FaHistory,
  FaClock, FaTrophy, FaCheckCircle, FaRobot, FaChalkboardTeacher, FaStar, FaRegStar,
  FaHome, FaBox, FaTicketAlt, FaQrcode, FaMobileAlt, FaCalendarDay, FaRegSmile,
  FaComments, FaPaperPlane, FaEyeSlash, FaEye, FaCamera, FaBuilding, FaLock, FaSpinner, FaCreditCard,
} from 'react-icons/fa';
import {
  GiBodyBalance, GiLeg, GiShoulderArmor, GiChest, GiBiceps, GiMuscularTorso, GiPull, GiPush,
  GiChestArmor, GiLegArmor, GiRunningShoe, GiArm, GiHeartBeats, GiFist, GiAbdominalArmor,
  GiSprint, GiRun,
} from 'react-icons/gi';
import { BRAND, Btn, Card, Badge, Input, Select, Logo, ProgressBar, Avatar, Modal } from '../components/ui';
import api, { resolveAvatarUrl } from '../api';
import { getSocket } from '../socket';
import { PROGRAM_CATEGORIES, PROGRAM_CATEGORY_LABELS } from '../programCategories';

const CATEGORY_ICONS = {
  full_body: <GiBodyBalance/>,
  push: <GiPush/>,
  pull: <GiPull/>,
  upper_body: <GiChestArmor/>,
  lower_body_abs: <GiLegArmor/>,
  chest: <GiChest/>,
  chest_arm: <GiBiceps/>,
  back: <GiMuscularTorso/>,
  leg: <GiLeg/>,
  leg_abs: <GiRunningShoe/>,
  shoulder: <GiShoulderArmor/>,
  shoulder_arm: <GiArm/>,
  shoulder_cardio: <GiHeartBeats/>,
  arm: <GiFist/>,
  abs: <GiAbdominalArmor/>,
  abs_cardio: <GiSprint/>,
  cardio: <GiRun/>,
};

// Aktif programın haftalık planında bugüne denk gelen günü döngüsel olarak hesaplar
function getTodayWorkout(program) {
  if (!program?.workoutPlan?.length) return null;
  const len = program.workoutPlan.length;
  const diffDays = Math.floor((new Date() - new Date(program.startDate)) / (1000 * 60 * 60 * 24));
  const idx = ((diffDays % len) + len) % len;
  return program.workoutPlan[idx];
}

// ─── Profilim & Diyet sekmesi (kişisel bilgiler + diyet tercihleri formu) ───
function ProfileDietTab({ onAvatarChange, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [program, setProgram] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [generating, setGen]  = useState(false);
  const [generatingAI, setGenAI] = useState(false);
  const [generatingDiet, setGenDiet] = useState(false);
  const [err, setErr]         = useState('');
  const [saved, setSavedMsg]  = useState(false);
  const [hideProfile, setHideProfile] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAcc, setDeletingAcc] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    heightCm:'', weightKg:'', age:'', gender:'male',
    targetWeightKg:'', weeklyWorkoutDays:'3', activityLevel:'moderate',
  });
  const set = (k) => (e) => { setSavedMsg(false); setForm({ ...form, [k]: e.target.value }); };

  const load = async () => {
    setLoading(true);
    try {
      const meData = await api.users.getMe();
      setMe(meData);
      setHideProfile(!!meData?.hideProfile);
    } catch (e) {
      setErr(e.message);
    }
    try {
      const p = await api.healthProfile.getMine();
      setProfile(p);
      if (p) {
        setForm({
          heightCm: p.heightCm, weightKg: p.weightKg, age: p.age, gender: p.gender,
          targetWeightKg: p.targetWeightKg, weeklyWorkoutDays: p.weeklyWorkoutDays,
          activityLevel: p.activityLevel,
        });
        setProgram(await api.fitness.active());
      }
    } catch (e) {
      if (e.message?.includes('profil')) {
        setErr('Lütfen profil bilgilerinizi giriniz.');
      } else {
        setErr(e.message);
      }
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const togglePrivacy = async () => {
    const next = !hideProfile;
    setSavingPrivacy(true);
    try {
      await api.users.updatePrivacy(next);
      setHideProfile(next);
    } catch (e) { setErr(e.message); }
    setSavingPrivacy(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(''); setUploadingAvatar(true);
    try {
      const result = await api.users.uploadAvatar(file);
      setMe((prev) => ({ ...prev, avatarUrl: result.avatarUrl }));
      onAvatarChange?.(result.avatarUrl);
    } catch (e) { setErr(e.message); }
    setUploadingAvatar(false);
    e.target.value = '';
  };

  const saveProfile = async () => {
    setErr(''); setSaving(true);
    try {
      const payload = {
        heightCm: +form.heightCm, weightKg: +form.weightKg, age: +form.age,
        gender: form.gender, targetWeightKg: +form.targetWeightKg,
        weeklyWorkoutDays: +form.weeklyWorkoutDays, activityLevel: form.activityLevel,
      };
      const savedProfile = await api.healthProfile.save(payload);
      setProfile(savedProfile);
      setSavedMsg(true);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const generate = async () => {
    setErr(''); setGen(true);
    try {
      const prog = await api.fitness.generate();
      setProgram(prog);
    } catch (e) { setErr(e.message); }
    setGen(false);
  };

  const generateAI = async () => {
    setErr(''); setGenAI(true);
    try {
      const prog = await api.fitness.generateAI();
      setProgram(prog);
    } catch (e) { setErr(e.message); }
    setGenAI(false);
  };

  const generateDiet = async () => {
    setErr(''); setGenDiet(true);
    try {
      const prog = await api.fitness.generateDietAI();
      setProgram(prog);
    } catch (e) { setErr(e.message); }
    setGenDiet(false);
  };

  const confirmDeleteAccount = async () => {
    setErr('');
    setDeletingAcc(true);
    try {
      await api.users.deleteMe();
      if (onLogout) onLogout();
    } catch (e) {
      setErr(e.message);
      setShowDeleteModal(false);
    }
    setDeletingAcc(false);
  };

  if (loading) return <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>;

  return (
    <div>
      {err && (
        <div style={{
          background: err.includes('profil') ? '#eff6ff' : '#fee2e2',
          border: `1px solid ${err.includes('profil') ? '#bfdbfe' : '#fca5a5'}`,
          color: err.includes('profil') ? '#1e40af' : '#dc2626',
          borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14
        }}>
          {err}
        </div>
      )}

      <Card style={{ marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ position:'relative' }}>
          <Avatar src={resolveAvatarUrl(me?.avatarUrl)} name={me?.fullName} size={72} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} title="Fotoğrafı değiştir"
            style={{
              position:'absolute', bottom:-2, right:-2, width:26, height:26, borderRadius:'50%',
              background:BRAND.primary, border:'2px solid #fff', color:'#fff', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:12,
            }}>
            {uploadingAvatar ? '…' : <FaCamera size={11}/>}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display:'none' }} />
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:16 }}>{me?.fullName}</div>
          <div style={{ color:'#6b7280', fontSize:13 }}>{me?.email}</div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
            style={{ background:'none', border:'none', color:BRAND.primary, fontSize:12, fontWeight:600,
              cursor:'pointer', padding:0, marginTop:6 }}>
            {uploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf yükle'}
          </button>
        </div>
      </Card>

      <Card>
        <h3 style={{ margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}>
          {profile ? <><FaClipboardList/> Sağlık Bilgilerim</> : <><FaInfoCircle/> Önce Bilgilerini Gir</>}
        </h3>
        <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 18px' }}>
          {profile ? 'Bilgilerini güncelleyip aşağıdan programını yeniden oluşturabilirsin.' : 'Sana özel program için bu bilgiler gerekli.'}
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
          {saving ? 'Kaydediliyor...' : profile ? <><FaSave/> Bilgileri Güncelle</> : <><FaCheck/> Kaydet</>}
        </Btn>
        {saved && (
          <p style={{ color:'#16a34a', fontSize:13, marginTop:12, marginBottom:0, display:'flex', alignItems:'center', gap:6 }}>
            <FaCheck/> Kaydedildi.
          </p>
        )}
      </Card>

      <Card style={{ marginTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {hideProfile ? <FaEyeSlash size={20} color="#6b7280"/> : <FaEye size={20} color="#8b5cf6"/>}
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>Profilimi gizle</div>
            <div style={{ fontSize:12, color:'#6b7280' }}>
              {hideProfile
                ? 'Diğer üyeler seni sohbet listesinde göremez, yeni sohbet başlatamaz.'
                : 'Diğer üyeler seni sohbet listesinde görüp mesaj atabilir.'}
            </div>
          </div>
        </div>
        <button onClick={togglePrivacy} disabled={savingPrivacy} style={{
          width:46, height:26, borderRadius:13, border:'none', cursor:'pointer', position:'relative',
          background: hideProfile ? '#8b5cf6' : '#e5e7eb', transition:'background .15s', flexShrink:0,
        }}>
          <span style={{
            position:'absolute', top:3, left: hideProfile ? 23 : 3, width:20, height:20, borderRadius:'50%',
            background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left .15s',
          }} />
        </button>
      </Card>

      {profile && (
        <Card style={{ marginTop:20 }}>
          <h3 style={{ margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}><FaBullseye/> Antrenman & Diyet Programı</h3>
          <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 16px' }}>
            {program ? 'Yeni oluşturursan mevcut program geçmişe taşınır.' : 'Bilgilerine göre kişisel programını oluştur.'}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14 }}>
            <button onClick={generate} disabled={generating || generatingAI} style={{
              textAlign:'left', cursor: generatingAI ? 'not-allowed' : 'pointer', border:'1.5px solid #e5e7eb',
              borderRadius:12, padding:'16px 18px', background:'#fff', display:'flex', flexDirection:'column', gap:6,
              opacity: generatingAI ? 0.5 : 1, transition:'border-color .15s, transform .12s',
            }}
              onMouseEnter={e => { if (!generatingAI) e.currentTarget.style.borderColor = '#8b5cf6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, color:'#8b5cf6', fontWeight:700, fontSize:15 }}>
                <FaBolt/> Hızlı Oluştur
              </div>
              <div style={{ fontSize:12, color:'#6b7280' }}>Kurallara dayalı hesaplama, anında sonuç.</div>
              {generating && <div style={{ fontSize:12, color:'#8b5cf6', fontWeight:600 }}>Oluşturuluyor...</div>}
              {!generating && program && <div style={{ fontSize:12, color:'#8b5cf6', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}><FaSyncAlt/> Yeniden oluştur</div>}
            </button>

            <button onClick={generateAI} disabled={generating || generatingAI} style={{
              textAlign:'left', cursor: generating ? 'not-allowed' : 'pointer', border:'none', borderRadius:12,
              padding:'16px 18px', background:`linear-gradient(135deg, ${BRAND.purple}, ${BRAND.primary})`, color:'#fff',
              display:'flex', flexDirection:'column', gap:6, opacity: generating ? 0.5 : 1,
              boxShadow:'0 4px 14px rgba(83,52,131,.35)', transition:'transform .12s',
            }}
              onMouseEnter={e => { if (!generating) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:15 }}>
                <FaRobot/> AI ile Oluştur
              </div>
              <div style={{ fontSize:12, color:'#ffffffcc' }}>Yapay zeka sana özel bir program hazırlasın.</div>
              {generatingAI && <div style={{ fontSize:12, fontWeight:600 }}>AI düşünüyor...</div>}
            </button>
          </div>
        </Card>
      )}

      {program && (
        <>
          <Card style={{ marginTop:20 }}>
            <h3 style={{ margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}><FaAppleAlt/> Günlük Beslenme Hedefi</h3>
            <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 16px' }}>
              Aktif programına göre hesaplanan günlük hedeflerin.
            </p>
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

          {/* Detailed Diet List Generator/Renderer */}
          <div style={{ marginTop: 20 }}>
            {program.dietPlan ? (
              <div>
                <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaAppleAlt /> Yapay Zeka Detaylı Öğün Programı
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {program.dietPlan.meals.map((meal, index) => (
                    <Card key={index} style={{ borderLeft: `4px solid ${BRAND.primary}`, background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark }}>{meal.name}</span>
                          <Badge label={meal.time} color="#6b7280" />
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Badge label={`${meal.calories} kcal`} color="#e94560" />
                          {meal.macros && (
                            <>
                              <Badge label={`P: ${meal.macros.protein}g`} color="#3b82f6" />
                              <Badge label={`K: ${meal.macros.carbs}g`} color="#f59e0b" />
                              <Badge label={`Y: ${meal.macros.fat}g`} color="#10b981" />
                            </>
                          )}
                        </div>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                        {meal.items.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card style={{ textAlign: 'center', padding: '30px 20px', border: '1.5px dashed #d1d5db', background: '#f9fafb' }}>
                <div style={{ fontSize: 32, color: BRAND.primary, marginBottom: 8 }}><FaAppleAlt /></div>
                <h4 style={{ margin: '0 0 4px' }}>Detaylı Günlük Öğün Listesi Bulunmuyor</h4>
                <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                  Hedef kalori ve makrolarınıza uygun örnek kahvaltı, öğle, akşam yemekleri ve ara öğün listesi oluşturun.
                </p>
                <Btn onClick={generateDiet} disabled={generatingDiet} style={{ margin: '0 auto' }}>
                  {generatingDiet ? 'Öğünler Hesaplanıyor...' : <><FaRobot /> AI ile Diyet Listesi Oluştur</>}
                </Btn>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Hesabı Sil (Danger Zone) */}
      <Card style={{ marginTop: 30, borderLeft: '4px solid #dc2626', background: '#fff' }}>
        <h4 style={{ margin: '0 0 4px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaExclamationTriangle /> Hesabı Sil
        </h4>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 14px' }}>
          Hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz. (Aktif bir üyelik paketiniz varsa silme işlemi yapılamaz).
        </p>
        <Btn onClick={() => setShowDeleteModal(true)} color="#dc2626" outline size="sm">
          Hesabımı Sil
        </Btn>
      </Card>

      {showDeleteModal && (
        <Modal title="Hesabı Sil Onayı" onClose={() => setShowDeleteModal(false)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, color: '#dc2626', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <FaExclamationTriangle />
            </div>
            <h3 style={{ margin: '0 0 8px' }}>Hesabınızı silmek istediğinize emin misiniz?</h3>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px' }}>
              Bu işlem geri alınamaz. Aktif bir üyelik paketiniz varsa sistem silme işlemine izin vermeyecektir.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={confirmDeleteAccount} disabled={deletingAcc} color="#dc2626" style={{ flex: 1, justifyContent: 'center' }}>
                {deletingAcc ? 'Siliniyor...' : 'Evet, Hesabımı Sil'}
              </Btn>
              <Btn onClick={() => setShowDeleteModal(false)} color="#6b7280" outline style={{ flex: 1, justifyContent: 'center' }}>
                İptal
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Programım sekmesi (bugünkü antrenman + program üretme/görüntüleme) ───
function MyProgramTab() {
  const [profile, setProfile]   = useState(null);
  const [program, setProgram]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [err, setErr]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const p = await api.healthProfile.getMine();
      setProfile(p);
      if (p) {
        const active = await api.fitness.active();
        setProgram(active);
        const hist = await api.fitness.history();
        setHistory(hist);
      }
    } catch (e) {
      if (e.message?.includes('profil')) {
        setErr('Lütfen profil bilgilerinizi giriniz.');
      } else {
        setErr(e.message);
      }
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>;

  const goalLabel = { gain:'Kilo Alma', lose:'Kilo Verme', maintain:'Koruma' };

  const daysLeft = program
    ? Math.ceil((new Date(program.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const todayWorkout = getTodayWorkout(program);

  return (
    <div>
      {err && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', color:'#dc2626',
        borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{err}</div>}

      {!profile && (
        <Card style={{ marginBottom:20, textAlign:'center', padding:40 }}>
          <div style={{ fontSize:48, marginBottom:12, display:'flex', justifyContent:'center' }}><FaInfoCircle/></div>
          <h3 style={{ margin:'0 0 6px' }}>Önce bilgilerini gir</h3>
          <p style={{ color:'#6b7280', margin:0 }}>
            Sana özel bir antrenman programı oluşturmak için <FaUser style={{ verticalAlign:'-2px' }}/> Profilim &amp; Diyet sekmesinden bilgilerini tamamla.
          </p>
        </Card>
      )}

      {todayWorkout && (
        <Card style={{ marginBottom:20, border:`2px solid ${BRAND.purple}`, background:'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div>
              <h3 style={{ margin:'0 0 6px', color:'#4c1d95', display:'flex', alignItems:'center', gap:8 }}><FaCalendarDay/> Bugün Yapman Gerekenler</h3>
              <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>{todayWorkout.focus}</p>
            </div>
            <Badge label={`Gün ${todayWorkout.day}/${program.workoutPlan.length}`} color="#8b5cf6" />
          </div>
          <div style={{ display:'grid', gap:8, marginTop:16 }}>
            {todayWorkout.exercises.map((ex, i) => (
              <div key={ex.id ?? `${ex.name}-${i}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                background:'#fff', borderRadius:8, padding:'10px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
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
      )}

      {profile && !program && (
        <Card style={{ marginBottom:20, textAlign:'center', padding:40 }}>
          <div style={{ fontSize:48, marginBottom:12, display:'flex', justifyContent:'center' }}><FaBullseye/></div>
          <h3 style={{ margin:'0 0 6px' }}>Henüz bir programın yok</h3>
          <p style={{ color:'#6b7280', margin:0 }}>
            Bilgilerine göre program oluşturmak için <FaUser style={{ verticalAlign:'-2px' }}/> Profilim &amp; Diyet sekmesine git.
          </p>
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
              <Badge label={<><FaHourglassHalf/> {daysLeft} gün kaldı</>} color="#e94560" />
            </div>
            {program.warnings && program.warnings.length > 0 && (
              <div style={{ marginBottom:16 }}>
                {program.warnings.map((w, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start',
                    background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10,
                    padding:'12px 14px', marginBottom:8 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}><FaExclamationTriangle/></span>
                    <span style={{ fontSize:13, color:'#92400e', lineHeight:1.5 }}>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <h4 style={{ margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}><FaDumbbell/> Haftalık Antrenman Planı</h4>
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
                  {day.exercises.map((ex, i) => (
                    <div key={ex.id ?? `${ex.name}-${i}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
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

          <p style={{ color:'#9ca3af', fontSize:12, marginTop:16, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <FaExclamationTriangle/> Bu program genel hesaplamalara dayanır. Sağlık durumunuza göre bir uzmana danışın.
          </p>

          {history.filter(h => !h.isActive).length > 0 && (
            <div style={{ marginTop:24 }}>
              <div
                onClick={() => setShowHistory(!showHistory)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  cursor:'pointer', padding:'12px 0' }}>
                <h4 style={{ margin:0, display:'flex', alignItems:'center', gap:8 }}>
                  <FaHistory/> Geçmiş Programlar ({history.filter(h => !h.isActive).length})
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

// ─── Başarılarım sekmesi (rozetler + salon doluluk tahmini) ───
function AchievementsTab() {
  const [occupancy, setOccupancy] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [prediction, gamificationData] = await Promise.all([
          api.dashboard.getOccupancyPrediction(),
          api.users.getGamification(),
        ]);
        setOccupancy(prediction);
        setGamification(gamificationData);
      } catch (e) { alert(e.message); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>;

  const checkInCount = gamification?.checkInCount || 0;
  const achievements = [
    {
      name: 'İlk Adım',
      description: 'İlk check-inini tamamla',
      threshold: 1,
      unlocked: (gamification?.badges || []).includes('İlk Adım'),
    },
    {
      name: 'Düzenli Üye',
      description: '5 check-in ile düzenli üyeliği yakala',
      threshold: 5,
      unlocked: (gamification?.badges || []).includes('Düzenli Üye'),
    },
    {
      name: 'Haftanın Kahramanı',
      description: '10 check-in ile zirveye çık',
      threshold: 10,
      unlocked: (gamification?.badges || []).includes('Haftanın Kahramanı'),
    },
  ];

  return (
    <div>
      {occupancy && (
        <Card style={{ marginBottom:20, border:'2px solid #f59e0b', background:'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div>
              <h3 style={{ margin:'0 0 6px', color:'#9a2c00', display:'flex', alignItems:'center', gap:8 }}><FaClock/> Bugün salon doluluk tahmini</h3>
              <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>
                {occupancy.recommendation || 'Bu saat için tahmin hazırlanıyor.'}
              </p>
            </div>
            <Badge label={`${occupancy.occupancyPercent ?? 0}% dolu`} color={occupancy.intensity === 'yüksek' ? '#e94560' : occupancy.intensity === 'orta' ? '#f59e0b' : '#10b981'} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginTop:16 }}>
            <div style={{ background:'#fff', borderRadius:10, padding:'12px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:12, color:'#6b7280' }}>Bu saat</div>
              <div style={{ fontSize:20, fontWeight:800 }}>{occupancy.day} {occupancy.hour}:00</div>
            </div>
            <div style={{ background:'#fff', borderRadius:10, padding:'12px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:12, color:'#6b7280' }}>Yoğunluk</div>
              <div style={{ fontSize:20, fontWeight:800 }}>{occupancy.intensity}</div>
            </div>
            <div style={{ background:'#fff', borderRadius:10, padding:'12px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:12, color:'#6b7280' }}>En sakin saatler</div>
              <div style={{ fontSize:14, fontWeight:700 }}>{(occupancy.quietSlots || []).slice(0, 2).map((slot) => `${slot.day} ${slot.hour}:00`).join(' · ') || 'Veri yok'}</div>
            </div>
          </div>
        </Card>
      )}

      {gamification && (
        <Card style={{ background:'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)', border:'1px solid #f9a8d4' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div>
              <h3 style={{ margin:'0 0 6px', display:'flex', alignItems:'center', gap:8 }}><FaTrophy/> Başarılar</h3>
              <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>
                Toplam {gamification.points} puan ve {gamification.badges?.length || 0} başarın var.
              </p>
            </div>
            <Badge label={`${gamification.points} puan`} color="#ec4899" />
          </div>
          <div style={{ marginTop:14 }}>
            <ProgressBar
              value={gamification.badges?.length || 0}
              max={achievements.length}
              color="#ec4899"
              label="Genel ilerleme"
            />
          </div>
          <div style={{ marginTop:14, overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ textAlign:'left', color:'#6b7280' }}>
                  <th style={{ padding:'8px 10px', borderBottom:'1px solid #e5e7eb' }}>Başarı</th>
                  <th style={{ padding:'8px 10px', borderBottom:'1px solid #e5e7eb' }}>Durum</th>
                  <th style={{ padding:'8px 10px', borderBottom:'1px solid #e5e7eb', minWidth:160 }}>İlerleme</th>
                  <th style={{ padding:'8px 10px', borderBottom:'1px solid #e5e7eb' }}>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((achievement) => (
                  <tr key={achievement.name}>
                    <td style={{ padding:'10px', borderBottom:'1px solid #f3f4f6', fontWeight:700 }}>{achievement.name}</td>
                    <td style={{ padding:'10px', borderBottom:'1px solid #f3f4f6' }}>
                      {achievement.unlocked ? <><FaCheckCircle color="#10b981"/> Açıldı</> : <><FaHourglassHalf/> Beklemede</>}
                    </td>
                    <td style={{ padding:'10px', borderBottom:'1px solid #f3f4f6' }}>
                      <ProgressBar
                        value={Math.min(checkInCount, achievement.threshold)}
                        max={achievement.threshold}
                        color={achievement.unlocked ? '#10b981' : '#ec4899'}
                        height={8}
                      />
                    </td>
                    <td style={{ padding:'10px', borderBottom:'1px solid #f3f4f6', color:'#6b7280' }}>{achievement.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Programlar sekmesi (kategoriye göre katalog + değerlendirme) ───
function ProgramsCatalogTab() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [ratingDraft, setRatingDraft] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setPrograms(await api.programs.getAll()); }
    catch (e) { alert(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>;

  const countFor = (cat) => programs.filter((p) => p.category === cat).length;

  const submitRating = async (programId) => {
    const draft = ratingDraft[programId] || {};
    if (!draft.rating) { alert('Lütfen bir yıldız puanı seç.'); return; }
    setSubmitting(programId);
    try {
      await api.programs.rate(programId, { rating: draft.rating, comment: draft.comment });
      await load();
      setRatingDraft({ ...ratingDraft, [programId]: {} });
    } catch (e) { alert(e.message); }
    setSubmitting(null);
  };

  const handleActivate = async (programId) => {
    if (!window.confirm('Bu antrenman programını aktif programınız olarak ayarlamak istediğinize emin misiniz?')) return;
    try {
      await api.fitness.activate(programId);
      alert('Program başarıyla aktifleştirildi! Profil sekmesinden detayları görebilirsiniz.');
    } catch (e) {
      alert(e.message);
    }
  };

  if (!category) {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
        {PROGRAM_CATEGORIES.map((c) => (
          <Card key={c.value} style={{ cursor:'pointer', textAlign:'center', padding:28 }}
            onClick={() => setCategory(c.value)}>
            <div style={{ fontSize:32, marginBottom:8 }}>{CATEGORY_ICONS[c.value]}</div>
            <h3 style={{ margin:'0 0 4px' }}>{c.label}</h3>
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>{countFor(c.value)} program</p>
          </Card>
        ))}
      </div>
    );
  }

  const list = programs.filter((p) => p.category === category);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <Btn size="sm" outline onClick={() => setCategory(null)}>← Kategoriler</Btn>
        <h2 style={{ margin:0 }}>{CATEGORY_ICONS[category]} {PROGRAM_CATEGORY_LABELS[category]}</h2>
      </div>

      {list.length === 0 && (
        <Card style={{ textAlign:'center', padding:40 }}>
          <p style={{ color:'#6b7280', margin:0 }}>Bu kategoride henüz program yok.</p>
        </Card>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {list.map((p) => {
          const myDraft = ratingDraft[p.id] || {};
          const comments = (p.ratings || []).filter((r) => r.comment);
          return (
            <Card key={p.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <h3 style={{ margin:0 }}>{p.name}</h3>
                <Btn size="sm" onClick={() => handleActivate(p.id)} color="#10b981">
                  <FaBolt/> Aktifleştir
                </Btn>
              </div>
              <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 12px' }}>{p.description}</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                <Badge label={p.difficulty} color="#8b5cf6" />
                <Badge label={`${p.weeksCount} Hafta`} color="#10b981" />
                <Badge label={p.source === 'ai' ? <><FaRobot/> AI</> : <><FaChalkboardTeacher/> Antrenör</>} color={p.source === 'ai' ? '#f59e0b' : '#6b7280'} />
                {p.ratingCount > 0 && <Badge label={<><FaStar/> {p.avgRating} ({p.ratingCount})</>} color="#ec4899" />}
              </div>

              <div style={{ display:'grid', gap:8 }}>
                {(p.exercises || []).map((e) => (
                  <div key={e.id} style={{ display:'flex', justifyContent:'space-between',
                    background:'#f8fafc', borderRadius:8, padding:'10px 14px', fontSize:14 }}>
                    <span style={{ fontWeight:500 }}>{e.name}</span>
                    <div style={{ display:'flex', gap:8 }}>
                      <Badge label={e.muscleGroup} color="#f59e0b" />
                      <Badge label={`${e.sets}×${e.reps}`} color="#3b82f6" />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #f0f0f0' }}>
                <div style={{ fontSize:13, color:'#6b7280', marginBottom:8 }}>Bu programı değerlendir</div>
                <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star}
                      onClick={() => setRatingDraft({ ...ratingDraft, [p.id]: { ...myDraft, rating: star } })}
                      style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, padding:0,
                        color: (myDraft.rating || 0) >= star ? '#f59e0b' : '#e5e7eb', display:'flex' }}>
                      {(myDraft.rating || 0) >= star ? <FaStar/> : <FaRegStar/>}
                    </button>
                  ))}
                </div>
                <textarea
                  value={myDraft.comment || ''}
                  onChange={(e) => setRatingDraft({ ...ratingDraft, [p.id]: { ...myDraft, comment: e.target.value } })}
                  placeholder="Yorumun (opsiyonel)"
                  style={{ width:'100%', minHeight:60, padding:'8px 10px', borderRadius:8,
                    border:'1.5px solid #e5e7eb', fontSize:13, boxSizing:'border-box', resize:'vertical' }}
                />
                <Btn size="sm" style={{ marginTop:8 }} onClick={() => submitRating(p.id)}>
                  {submitting === p.id ? 'Gönderiliyor...' : <><FaCheck/> Değerlendir</>}
                </Btn>

                {comments.length > 0 && (
                  <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:8 }}>
                    {comments.map((r) => (
                      <div key={r.id} style={{ background:'#f8fafc', borderRadius:8, padding:'8px 12px', fontSize:13 }}>
                        <div style={{ fontWeight:600, display:'flex', alignItems:'center', gap:2 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            star <= r.rating
                              ? <FaStar key={star} color="#f59e0b" size={12}/>
                              : <FaRegStar key={star} color="#e5e7eb" size={12}/>
                          ))}
                          <span style={{ color:'#6b7280', fontWeight:400, marginLeft:4 }}> · {r.user?.fullName}</span>
                        </div>
                        <div style={{ color:'#374151', marginTop:2 }}>{r.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sohbet sekmesi (üyeler arası birebir mesajlaşma) ───
function ChatTab({ user }) {
  const [conversations, setConversations] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [showDirectory, setShowDirectory] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const activeUserRef = useRef(null);
  useEffect(() => { activeUserRef.current = activeUser; }, [activeUser]);

  const loadConversations = async () => {
    try { setConversations(await api.messages.getConversations()); }
    catch (e) { alert(e.message); }
  };

  const loadDirectory = async () => {
    try { setDirectory(await api.messages.getDirectory()); }
    catch (e) { alert(e.message); }
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (msg) => {
      const otherPartyId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
      if (activeUserRef.current && otherPartyId === activeUserRef.current.id) {
        setThread((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      loadConversations();
    };
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [thread]);

  const openThread = async (otherUser) => {
    setActiveUser(otherUser);
    setShowDirectory(false);
    setLoadingThread(true);
    try {
      const msgs = await api.messages.getThread(otherUser.id);
      setThread(msgs);
      loadConversations();
    } catch (e) { alert(e.message); }
    setLoadingThread(false);
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeUser || sending) return;
    setSending(true);
    try {
      const msg = await api.messages.send(activeUser.id, content);
      setThread((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft('');
      loadConversations();
    } catch (e) { alert(e.message); }
    setSending(false);
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:16, height:560 }}>
      <Card style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h4 style={{ margin:0, display:'flex', alignItems:'center', gap:8 }}><FaComments/> Sohbetler</h4>
          <Btn size="sm" outline onClick={() => { setShowDirectory(!showDirectory); if (!showDirectory) loadDirectory(); }}>
            {showDirectory ? 'Geri' : '+ Yeni'}
          </Btn>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {showDirectory ? (
            directory.length === 0 ? (
              <p style={{ padding:16, color:'#9ca3af', fontSize:13 }}>Sohbet başlatılabilecek üye yok.</p>
            ) : directory.map((u) => (
              <div key={u.id} onClick={() => openThread(u)}
                style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #f8fafc',
                  display:'flex', alignItems:'center', gap:10 }}>
                <Avatar src={resolveAvatarUrl(u.avatarUrl)} name={u.fullName} size={30} />
                <span style={{ fontWeight:600, fontSize:14 }}>{u.fullName}</span>
              </div>
            ))
          ) : (
            conversations.length === 0 ? (
              <p style={{ padding:16, color:'#9ca3af', fontSize:13 }}>Henüz sohbetin yok. "+ Yeni" ile başlat.</p>
            ) : conversations.map((c) => (
              <div key={c.user.id} onClick={() => openThread(c.user)}
                style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #f8fafc',
                  display:'flex', alignItems:'center', gap:10,
                  background: activeUser?.id === c.user.id ? '#faf5ff' : 'transparent' }}>
                <Avatar src={resolveAvatarUrl(c.user.avatarUrl)} name={c.user.fullName} size={34} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>{c.user.fullName}</span>
                    {c.unreadCount > 0 && <Badge label={c.unreadCount} color="#e94560" />}
                  </div>
                  <div style={{ fontSize:12, color:'#6b7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {c.lastMessage.senderId === user.id ? 'Sen: ' : ''}{c.lastMessage.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card style={{ padding:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {!activeUser ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#9ca3af', gap:10 }}>
            <FaComments size={40}/>
            <p style={{ margin:0 }}>Sohbet etmek için soldan bir üye seç.</p>
          </div>
        ) : (
          <>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid #f0f0f0', fontWeight:700, display:'flex', alignItems:'center', gap:10 }}>
              <Avatar src={resolveAvatarUrl(activeUser.avatarUrl)} name={activeUser.fullName} size={30} /> {activeUser.fullName}
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:8 }}>
              {loadingThread ? (
                <p style={{ color:'#9ca3af', textAlign:'center' }}>Yükleniyor...</p>
              ) : thread.length === 0 ? (
                <p style={{ color:'#9ca3af', textAlign:'center' }}>İlk mesajı sen gönder!</p>
              ) : thread.map((m) => (
                <div key={m.id} style={{
                  alignSelf: m.senderId === user.id ? 'flex-end' : 'flex-start',
                  background: m.senderId === user.id ? BRAND.primary : '#f3f4f6',
                  color: m.senderId === user.id ? '#fff' : '#111827',
                  borderRadius:14, padding:'8px 14px', maxWidth:'70%', fontSize:14, wordBreak:'break-word',
                }}>
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding:12, borderTop:'1px solid #f0f0f0', display:'flex', gap:8 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Mesaj yaz..."
                style={{ flex:1, border:'1.5px solid #e5e7eb', borderRadius:9, padding:'10px 14px', fontSize:14, outline:'none' }}
              />
              <Btn onClick={sendMessage}><FaPaperPlane/></Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// ─── Anasayfa sekmesi (tüm sekmelerden özet) ───
function DashboardOverviewTab({ user, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [program, setProgram] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [occupancy, setOccupancy] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [myEnrollments, myProfile, gamificationData, occupancyData] = await Promise.all([
          api.enrollments.getMine().catch(err => {
            console.error('Enrollments error:', err);
            return [];
          }),
          api.healthProfile.getMine().catch(err => {
            console.warn('Profile not found/error:', err.message);
            return null;
          }),
          api.users.getGamification().catch(err => {
            console.error('Gamification error:', err);
            return null;
          }),
          api.dashboard.getOccupancyPrediction().catch(err => {
            console.error('Occupancy prediction error:', err);
            return null;
          }),
        ]);
        setEnrollments(myEnrollments);
        setProfile(myProfile);
        setGamification(gamificationData);
        setOccupancy(occupancyData);
        if (myProfile) {
          try {
            setProgram(await api.fitness.active());
          } catch (err) {
            console.error('Active program error:', err);
          }
        }
      } catch (e) {
        console.error('Overview tab initialization error:', e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Card style={{ textAlign:'center', padding:40 }}>Yükleniyor...</Card>;

  const now = new Date();
  const activeEnrollment = enrollments.find((e) => e.status === 'active' && new Date(e.endDate) >= now);
  const todayWorkout = getTodayWorkout(program);
  const badgeCount = gamification?.badges?.length || 0;

  return (
    <div>
      <Card style={{ marginBottom:20, border:'none', background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})` }}>
        <h2 style={{ margin:'0 0 4px', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>Hoş geldin, {user.fullName?.split(' ')[0]} <FaRegSmile/></h2>
        <p style={{ color:'#ffffffcc', margin:0, fontSize:14 }}>İşte bugünkü genel durumun.</p>
      </Card>

      {!profile && (
        <Card style={{
          marginBottom: 20,
          border: '1px solid #bfdbfe',
          background: '#eff6ff',
          color: '#1e40af',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaInfoCircle size={20} color="#3b82f6" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Profil Bilgileriniz Eksik</div>
              <div style={{ fontSize: 13, color: '#1e40af', marginTop: 2 }}>
                Lütfen diyet ve antrenman programı oluşturabilmemiz için profil bilgilerinizi giriniz.
              </div>
            </div>
          </div>
          <Btn size="sm" color="#3b82f6" onClick={() => onNavigate('profile')}>Profili Tamamla</Btn>
        </Card>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))', gap:16, alignItems:'start' }}>

        {/* Sol üst: bugünkü antrenmanın küçük hâli */}
        <Card style={{ border:`2px solid ${BRAND.purple}`, background:'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:12 }}>
            <h4 style={{ margin:0, color:'#4c1d95', display:'flex', alignItems:'center', gap:8 }}><FaCalendarDay/> Bugünkü Antrenman</h4>
            {todayWorkout && <Badge label={`Gün ${todayWorkout.day}/${program.workoutPlan.length}`} color="#8b5cf6" />}
          </div>
          {todayWorkout ? (
            <>
              <div style={{ fontSize:14, fontWeight:600, color:'#6b7280', marginBottom:10 }}>{todayWorkout.focus}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {todayWorkout.exercises.slice(0, 3).map((ex, i) => (
                  <div key={ex.id ?? `${ex.name}-${i}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    background:'#fff', borderRadius:8, padding:'8px 12px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontWeight:600, fontSize:13 }}>{ex.name}</span>
                    <Badge label={`${ex.sets}×${ex.reps}`} color="#3b82f6" />
                  </div>
                ))}
                {todayWorkout.exercises.length > 3 && (
                  <div style={{ color:'#8892a4', fontSize:12, textAlign:'center' }}>
                    +{todayWorkout.exercises.length - 3} egzersiz daha
                  </div>
                )}
              </div>
            </>
          ) : (
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>
              {profile ? 'Henüz bir programın yok.' : 'Önce profilini tamamla.'}
            </p>
          )}
          <Btn size="sm" outline color={BRAND.purple} style={{ marginTop:14 }} onClick={() => onNavigate('myprogram')}>Programım →</Btn>
        </Card>

        {/* Sağ üst: salon doluluğunun küçük hâli */}
        <Card style={{ border:'2px solid #f59e0b', background:'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:12 }}>
            <h4 style={{ margin:0, color:'#9a2c00', display:'flex', alignItems:'center', gap:8 }}><FaClock/> Salon Doluluğu</h4>
            {occupancy?.occupancyPercent != null && (
              <Badge label={`${occupancy.occupancyPercent}% dolu`}
                color={occupancy.intensity === 'yüksek' ? '#e94560' : occupancy.intensity === 'orta' ? '#f59e0b' : '#10b981'} />
            )}
          </div>
          {occupancy?.occupancyPercent != null ? (
            <>
              <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 10px' }}>
                {occupancy.recommendation || 'Bu saat için tahmin hazırlanıyor.'}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ background:'#fff', borderRadius:8, padding:'8px 12px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize:11, color:'#6b7280' }}>Bu saat</div>
                  <div style={{ fontSize:15, fontWeight:800 }}>{occupancy.day} {occupancy.hour}:00</div>
                </div>
                <div style={{ background:'#fff', borderRadius:8, padding:'8px 12px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize:11, color:'#6b7280' }}>En sakin saat</div>
                  <div style={{ fontSize:15, fontWeight:800 }}>
                    {occupancy.quietSlots?.[0] ? `${occupancy.quietSlots[0].day} ${occupancy.quietSlots[0].hour}:00` : 'Veri yok'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>Henüz yeterli veri yok.</p>
          )}
          <Btn size="sm" outline color="#f59e0b" style={{ marginTop:14 }} onClick={() => onNavigate('achievements')}>Detaylar →</Btn>
        </Card>

        {/* Sol alt: üyelik + beslenme */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <h4 style={{ margin:'0 0 8px', display:'flex', alignItems:'center', gap:8 }}><FaTicketAlt/> Üyeliğim</h4>
            {activeEnrollment ? (
              <>
                <div style={{ fontSize:18, fontWeight:700 }}>{activeEnrollment.plan?.name}</div>
                <div style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>
                  {Math.max(0, Math.ceil((new Date(activeEnrollment.endDate) - now) / 86400000))} gün kaldı
                </div>
                {activeEnrollment.totalPtSessions > 0 && (
                  <div style={{ color:'#8b5cf6', fontSize:13, fontWeight:600, marginTop:8 }}>
                    Kalan PT Seansı: {activeEnrollment.remainingPtSessions} / {activeEnrollment.totalPtSessions} ders
                  </div>
                )}
              </>
            ) : (
              <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>Aktif üyeliğin yok.</p>
            )}
            <Btn size="sm" outline style={{ marginTop:12 }} onClick={() => onNavigate('mine')}>Üyeliklerim →</Btn>
          </Card>

          <Card>
            <h4 style={{ margin:'0 0 8px', display:'flex', alignItems:'center', gap:8 }}><FaAppleAlt/> Beslenme Hedefi</h4>
            {program ? (
              <>
                <div style={{ fontSize:18, fontWeight:700 }}>{program.dailyCalories} kcal</div>
                <div style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>
                  P {program.proteinG}g · K {program.carbsG}g · Y {program.fatG}g
                </div>
              </>
            ) : (
              <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>Henüz bir diyet hedefin yok.</p>
            )}
            <Btn size="sm" outline style={{ marginTop:12 }} onClick={() => onNavigate('profile')}>Profilim & Diyet →</Btn>
          </Card>
        </div>

        {/* Sağ alt: başarılar + QR */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <h4 style={{ margin:'0 0 8px', display:'flex', alignItems:'center', gap:8 }}><FaTrophy/> Başarılarım</h4>
            <div style={{ fontSize:18, fontWeight:700 }}>{gamification?.points || 0} puan</div>
            <div style={{ marginTop:10 }}>
              <ProgressBar value={badgeCount} max={3} color="#ec4899" height={8} />
            </div>
            <Btn size="sm" outline style={{ marginTop:12 }} onClick={() => onNavigate('achievements')}>Başarılarım →</Btn>
          </Card>

          <Card>
            <h4 style={{ margin:'0 0 8px', display:'flex', alignItems:'center', gap:8 }}><FaQrcode/> QR Kodum</h4>
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>Salona girerken görevliye okut.</p>
            <Btn size="sm" outline style={{ marginTop:12 }} onClick={() => onNavigate('qr')}>QR Kodum →</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

const MEMBER_TABS = [
  { id:'dashboard', label:<><FaHome/> Anasayfa</> },
  { id:'plans',    label:<><FaBox/> Paketler</> },
  { id:'mine',     label:<><FaTicketAlt/> Üyeliklerim</> },
  { id:'programs', label:<><FaClipboardList/> Programlar</> },
  { id:'profile', label:<><FaUser/> Profilim & Diyet</> },
  { id:'myprogram', label:<><FaBullseye/> Programım</> },
  { id:'achievements', label:<><FaTrophy/> Başarılarım</> },
  { id:'chat', label:<><FaComments/> Sohbet</> },
  { id:'qr', label:<><FaQrcode/> QR Kodum</> },
];

// ─── Paketler sekmesi ───
function PlansTab() {
  const [plans, setPlans] = useState([]);
  const [hasActiveMembership, setHasActiveMembership] = useState(false);

  // Kredi Kartı Ödeme Modalı Durumları
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success'

  const load = async () => {
    try {
      const [allPlans, myEnrollments] = await Promise.all([
        api.plans.getAll(),
        api.enrollments.getMine(),
      ]);
      const activePlans = allPlans.filter(p => p.isActive);
      setPlans(activePlans);
      const now = new Date();
      const active = myEnrollments.some(e => e.status === 'active' && new Date(e.endDate) >= now);
      setHasActiveMembership(active);

      // Kayıt sonrasında bekleyen bir satın alma planı var mı kontrol et
      const pendingPlanId = localStorage.getItem('pendingPlanId');
      if (pendingPlanId && !active) {
        const found = activePlans.find(p => p.id === Number(pendingPlanId));
        if (found) {
          setSelectedPlan(found);
        }
        localStorage.removeItem('pendingPlanId');
      }
    } catch (e) { alert(e.message); }
  };
  useEffect(() => { load(); }, []);

  // Kart Numarası Formatlama (4 hanede bir boşluk)
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Son Kullanma Tarihi Formatlama (AA/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  // CVV Formatlama (En fazla 3 hane)
  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(val);
  };

  // Kart Markası Belirleme
  const detectCardType = (number) => {
    const clean = number.replace(/\s?/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    return 'Credit Card';
  };

  // Ödeme İşlemini Simüle Etme
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      alert('Lütfen tüm kart bilgilerini doldurunuz.');
      return;
    }
    if (cardNumber.replace(/\s?/g, '').length < 16) {
      alert('Kart numarası 16 hane olmalıdır.');
      return;
    }
    if (cardExpiry.length < 5) {
      alert('Son kullanma tarihi geçersiz (AA/YY).');
      return;
    }
    if (cardCvv.length < 3) {
      alert('CVV kodu 3 hane olmalıdır.');
      return;
    }

    setPaymentStatus('processing');

    setTimeout(async () => {
      try {
        await api.enrollments.create(selectedPlan.id);
        setPaymentStatus('success');
        setTimeout(() => {
          setSelectedPlan(null);
          setCardNumber('');
          setCardName('');
          setCardExpiry('');
          setCardCvv('');
          setIsFlipped(false);
          setPaymentStatus('idle');
          load();
        }, 1500);
      } catch (err) {
        alert(err.message);
        setPaymentStatus('idle');
      }
    }, 2000);
  };

  const cardType = detectCardType(cardNumber);

  // Kredi Kartı CSS inline stilleri
  const cardContainerStyle = {
    width: '100%',
    maxWidth: '290px',
    height: '170px',
    margin: '0 auto 24px',
    perspective: '1000px',
  };

  const cardInnerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'none',
  };

  const cardFaceCommon = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '14px',
    padding: '18px 20px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  };

  const cardFrontStyle = {
    ...cardFaceCommon,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', // Indigo - Violet gradyanı
  };

  const cardBackStyle = {
    ...cardFaceCommon,
    background: 'linear-gradient(135deg, #1e293b, #0f172a)', // Koyu premium arka plan
    transform: 'rotateY(180deg)',
    padding: '16px 0',
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
      {plans.length === 0 && (
        <Card style={{ textAlign:'center', padding:40, gridColumn:'1 / -1' }}>
          <div style={{ fontSize:48, marginBottom:12, display:'flex', justifyContent:'center' }}><FaBox/></div>
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
              borderRadius:9, color:'#16a34a', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <FaCheckCircle/> Zaten aktif üyeliğiniz var
            </div>
          ) : (
            <Btn onClick={() => setSelectedPlan(p)} style={{ width:'100%', justifyContent:'center' }}>
              <FaBullseye/> Üye Ol
            </Btn>
          )}
        </Card>
      ))}

      {selectedPlan && (
        <Modal title="Güvenli Ödeme Yap" onClose={() => { if (paymentStatus === 'idle') setSelectedPlan(null); }}>
          {paymentStatus === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <FaSpinner className="spin" size={48} color="#8b5cf6" />
              <div style={{ fontWeight: 600, fontSize: 16 }}>Ödeme Doğrulanıyor...</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Bankanızdan onay bekleniyor, lütfen pencereyi kapatmayın.</div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <FaCheckCircle size={56} color="#10b981" />
              <div style={{ fontWeight: 700, fontSize: 18, color: '#10b981' }}>Ödeme Başarılı!</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Üyeliğiniz aktif edilmiştir. Yönlendiriliyorsunuz...</div>
            </div>
          )}

          {paymentStatus === 'idle' && (
            <form onSubmit={handlePayment} style={{ padding: '4px 0' }}>
              {/* 3D Kredi Kartı Görseli */}
              <div style={cardContainerStyle}>
                <div style={cardInnerStyle}>
                  {/* Kart Ön Yüzü */}
                  <div style={cardFrontStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Kart Çipi */}
                      <div style={{ width: 38, height: 26, background: 'linear-gradient(135deg, #ffd700, #b8860b)', borderRadius: 5 }} />
                      <div style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: 18, letterSpacing: '1px' }}>{cardType}</div>
                    </div>
                    
                    <div style={{ fontSize: 16, fontFamily: 'Courier New, monospace', letterSpacing: '2.5px', margin: '14px 0 10px', textAlign: 'center' }}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ maxWidth: '70%', overflow: 'hidden' }}>
                        <div style={{ fontSize: 9, color: '#ffffff99', textTransform: 'uppercase', marginBottom: 2 }}>KART SAHİBİ</div>
                        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {cardName || 'AD SOYAD'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: '#ffffff99', textTransform: 'uppercase', marginBottom: 2 }}>SON KUL.</div>
                        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1px' }}>{cardExpiry || 'AA/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Kart Arka Yüzü */}
                  <div style={cardBackStyle}>
                    <div style={{ height: 32, background: '#000', width: '100%', marginTop: 8 }} />
                    <div style={{ padding: '0 20px', marginTop: 12 }}>
                      <div style={{ fontSize: 9, color: '#ffffffaa', textAlign: 'right', marginBottom: 4, textTransform: 'uppercase', paddingRight: 4 }}>CVV</div>
                      <div style={{ height: 28, background: '#fff', borderRadius: 4, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 10px', fontWeight: 'bold', letterSpacing: '1px', fontSize: 13 }}>
                        {cardCvv || '•••'}
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: '#ffffff66', textAlign: 'center', marginTop: 14 }}>
                      🔒 GÜVENLİ MOCK ÖDEME ALTYAPISI
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Alanları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input
                  label="Kart Sahibi Ad Soyad"
                  placeholder="KART SAHİBİNİN ADI"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.replace(/[^a-zA-ZıİğĞüÜşŞöÖçÇ\s]/g, ''))}
                  required
                />
                
                <Input
                  label="Kart Numarası"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Input
                    label="Son Kullanma Tarihi"
                    placeholder="AA/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    required
                  />
                  <Input
                    label="Güvenlik Kodu (CVV)"
                    placeholder="000"
                    value={cardCvv}
                    onChange={handleCvvChange}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12, margin: '6px 0 8px' }}>
                  <FaLock size={12} color="#10b981" />
                  <span>256-Bit SSL sertifikası ile güvenli şifrelenmiş sanal POS ödeme katmanı.</span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <Btn color="#6b7280" outline onClick={() => setSelectedPlan(null)} style={{ flex: 1, justifyContent: 'center' }}>
                    İptal
                  </Btn>
                  <Btn type="submit" style={{ flex: 2, justifyContent: 'center', background: '#10b981', borderColor: '#10b981' }}>
                    <FaCreditCard /> {selectedPlan.price} ₺ Güvenli Ödeme Yap
                  </Btn>
                </div>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── Üyeliklerim sekmesi ───
function MyEnrollmentsTab() {
  const [mine, setMine] = useState([]);

  useEffect(() => {
    (async () => {
      try { setMine(await api.enrollments.getMine()); }
      catch (e) { alert(e.message); }
    })();
  }, []);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {mine.length === 0 && (
        <Card style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:48, marginBottom:12, display:'flex', justifyContent:'center' }}><FaTicketAlt/></div>
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
            {e.totalPtSessions > 0 && (
              <div style={{ marginTop:6, fontSize:12, fontWeight:600, color:'#8b5cf6' }}>
                Kalan PT Dersi: {e.remainingPtSessions} / {e.totalPtSessions} seans
              </div>
            )}
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#10b981' }}>{e.amountPaid} ₺</div>
            <Badge label={e.status === 'active' ? 'Aktif' : 'Pasif'} color={e.status === 'active' ? '#10b981' : '#6b7280'} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── QR Kodum sekmesi ───
function MyQrTab({ user }) {
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try { setMe(await api.users.getMe()); }
      catch (e) { alert(e.message); }
    })();
  }, []);

  return (
    <div style={{ display:'flex', justifyContent:'center' }}>
      <Card style={{ maxWidth:380, width:'100%', textAlign:'center', padding:32 }}>
        <h3 style={{ margin:'0 0 6px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><FaMobileAlt/> Giriş QR Kodum</h3>
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
  );
}

// ─── Member Dashboard ───
export default function MemberDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/').filter(Boolean)[1] || 'dashboard';
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [gymName, setGymName] = useState(null);
  const [checkInNotice, setCheckInNotice] = useState(null);

  useEffect(() => {
    api.users.getMe().then((me) => {
      setAvatarUrl(me?.avatarUrl || null);
      if (me?.gym?.name) {
        setGymName(me.gym.name);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.log('📡 [WebSocket] Üye paneli: Aktif socket bağlantısı bulunamadı.');
      return;
    }
    console.log('📡 [WebSocket] Üye paneli: checkInNotification dinleyicisi kaydedildi.');
    const handleCheckIn = (data) => {
      console.log('🎉 [WebSocket] Üye paneli: Giriş bildirimi alındı!', data);
      setCheckInNotice(data);
    };
    socket.on('checkInNotification', handleCheckIn);
    return () => {
      console.log('📡 [WebSocket] Üye paneli: checkInNotification dinleyicisi kaldırıldı.');
      socket.off('checkInNotification', handleCheckIn);
    };
  }, []);

  const goTab = (id) => navigate(`/member/${id}`);

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Segoe UI,sans-serif' }}>
      <div style={{ background:`linear-gradient(135deg,${BRAND.primary},${BRAND.purple})`, padding:'14px 28px',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Logo light />
          {gymName && (
            <span style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(4px)',
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              <FaBuilding style={{ fontSize: 12 }} /> {gymName}
            </span>
          )}
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center', color:'#fff' }}>
          <span style={{ fontSize:14, display:'inline-flex', alignItems:'center', gap:8 }}>
            <Avatar src={resolveAvatarUrl(avatarUrl)} name={user.fullName} size={26} /> {user.fullName}
          </span>
          <Btn onClick={onLogout} color="#fff" outline size="sm">Çıkış</Btn>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
          {MEMBER_TABS.map(t => (
            <button key={t.id} onClick={() => goTab(t.id)} style={{
              padding:'9px 22px', borderRadius:10, border:`2px solid ${activeTab===t.id?BRAND.primary:'#e5e7eb'}`,
              background: activeTab===t.id ? BRAND.primary : '#fff',
              color: activeTab===t.id ? '#fff' : '#374151',
              fontWeight:600, fontSize:14, cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        <Routes>
          <Route path="dashboard" element={<DashboardOverviewTab user={user} onNavigate={goTab} />} />
          <Route path="plans" element={<PlansTab />} />
          <Route path="mine" element={<MyEnrollmentsTab />} />
          <Route path="programs" element={<ProgramsCatalogTab />} />
          <Route path="profile" element={<ProfileDietTab onAvatarChange={setAvatarUrl} onLogout={onLogout} />} />
          <Route path="myprogram" element={<MyProgramTab />} />
          <Route path="achievements" element={<AchievementsTab />} />
          <Route path="chat" element={<ChatTab user={user} />} />
          <Route path="qr" element={<MyQrTab user={user} />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>

      {checkInNotice && (
        <Modal title="Salona Giriş Başarılı! 🎉" onClose={() => setCheckInNotice(null)}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:52, marginBottom:10 }}>🏆</div>
            <h3 style={{ margin:'0 0 6px', color:'#10b981' }}>{checkInNotice.message}</h3>
            <p style={{ fontSize:14, color:'#6b7280', margin:'0 0 20px' }}>
              Plan: {checkInNotice.plan || '—'} · Geçerlilik: {checkInNotice.validUntil}
            </p>
            <div style={{ background:'#faf5ff', borderRadius:12, padding:16, border:'1px solid #f3e8ff', display:'inline-block', minWidth:200 }}>
              <div style={{ fontSize:13, color:'#7c3aed', fontWeight:600 }}>Kazanılan Puan: +{checkInNotice.pointsEarned} Puan</div>
              <div style={{ fontSize:14, fontWeight:700, marginTop:4, color:'#4b5563' }}>Toplam Puanınız: {checkInNotice.totalPoints}</div>
            </div>
            {checkInNotice.newBadges?.length > 0 && (
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#b45309', marginBottom:8 }}>Yeni Kazanılan Rozet(ler)! 🏅</div>
                <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap' }}>
                  {checkInNotice.newBadges.map(b => (
                    <Badge key={b} label={b} color="#d97706" />
                  ))}
                </div>
              </div>
            )}
            <Btn style={{ marginTop:24, width:'100%', justifyContent:'center' }} onClick={() => setCheckInNotice(null)}>Harika!</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}