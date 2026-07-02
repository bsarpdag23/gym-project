// ─────────────────────────────────────────────────────────
// Saf hesaplama fonksiyonları — DB yok, framework yok.
// Sadece veri girer, sonuç çıkar. Bu yüzden test edilmesi çok kolay.
// ─────────────────────────────────────────────────────────

export interface ProfileInput {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: string;         // 'male' | 'female'
  targetWeightKg: number;
  activityLevel: string;
}

export type GoalType = 'gain' | 'lose' | 'maintain';

// Aktivite seviyesi → TDEE çarpanı (standart değerler)
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary:   1.2,   // hareketsiz
  light:       1.375, // hafif (haftada 1-3 gün)
  moderate:    1.55,  // orta (haftada 3-5 gün)
  active:      1.725, // aktif (haftada 6-7 gün)
  very_active: 1.9,   // çok aktif (ağır iş/günde 2 antrenman)
};

// 1) BMR — Mifflin-St Jeor formülü
export function calcBMR(p: ProfileInput): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.gender === 'male' ? base + 5 : base - 161;
}

// 2) TDEE — BMR × aktivite çarpanı
export function calcTDEE(p: ProfileInput): number {
  const multiplier = ACTIVITY_MULTIPLIERS[p.activityLevel] ?? 1.55;
  return calcBMR(p) * multiplier;
}

// Hedefi belirle: mevcut kilo vs hedef kilo
export function determineGoal(p: ProfileInput): GoalType {
  const diff = p.targetWeightKg - p.weightKg;
  if (diff > 0.5)  return 'gain';
  if (diff < -0.5) return 'lose';
  return 'maintain';
}

// 3) Hedefe göre günlük kalori
export function calcTargetCalories(p: ProfileInput): number {
  const tdee = calcTDEE(p);
  const goal = determineGoal(p);
  if (goal === 'gain') return tdee + 400;  // sağlıklı kilo alma fazlası
  if (goal === 'lose') return tdee - 500;  // sağlıklı kilo verme açığı
  return tdee;
}

// 4) Makrolar (gram cinsinden)
export interface Macros {
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export function calcMacros(p: ProfileInput, calories: number): Macros {
  const proteinG = Math.round(p.weightKg * 2);          // kilo × 2 gr
  const fatG     = Math.round((calories * 0.25) / 9);   // kalorinin %25'i, 1 gr yağ = 9 kcal
  const proteinCals = proteinG * 4;                     // 1 gr protein = 4 kcal
  const fatCals     = fatG * 9;
  const carbsG   = Math.round((calories - proteinCals - fatCals) / 4); // kalan, 1 gr karb = 4 kcal
  return { proteinG, fatG, carbsG };
}

// 5) Sağlıklı süre (hafta) — hedefe güvenli hızda ulaşma
export function calcDurationWeeks(p: ProfileInput): number {
  const diff = Math.abs(p.targetWeightKg - p.weightKg);
  if (diff < 0.5) return 4; // koruma hedefi → varsayılan 4 hafta
  const goal = determineGoal(p);
  const weeklyRate = goal === 'gain' ? 0.35 : 0.7; // kg/hafta güvenli hız
  return Math.ceil(diff / weeklyRate);
}

// Hepsini birleştiren özet
export interface FitnessSummary {
  bmr: number;
  tdee: number;
  goal: GoalType;
  targetCalories: number;
  macros: Macros;
  durationWeeks: number;
  bmi: number;
  warnings: HealthWarning[];
}

export function buildSummary(p: ProfileInput): FitnessSummary {
  const bmr = Math.round(calcBMR(p));
  const tdee = Math.round(calcTDEE(p));
  const goal = determineGoal(p);
  const targetCalories = Math.round(calcTargetCalories(p));
  const macros = calcMacros(p, targetCalories);
  const durationWeeks = calcDurationWeeks(p);
  const bmi = +(p.weightKg / ((p.heightCm / 100) ** 2)).toFixed(1);
  const warnings = buildWarnings(p);
  return { bmr, tdee, goal, targetCalories, macros, durationWeeks, bmi, warnings };
}
// ─────────────────────────────────────────────────────────
// Antrenman planı üretici
// ─────────────────────────────────────────────────────────

// Basit egzersiz tipi (DB'den gelen alanların ihtiyacımız olan kısmı)
export interface ExerciseLite {
  id: number;
  name: string;
  muscleGroup: string;
  goalType: string;
  sets: number;
  reps: number;
  equipment: string;
}

export interface WorkoutDay {
  day: number;
  focus: string;
  exercises: ExerciseLite[];
}

// Haftalık antrenman gününe göre bölge dağılımı (split)
const SPLITS: Record<number, { focus: string; groups: string[] }[]> = {
  1: [{ focus: 'Tüm Vücut', groups: ['göğüs', 'sırt', 'bacak', 'omuz', 'kol', 'karın'] }],
  2: [
    { focus: 'Üst Vücut', groups: ['göğüs', 'sırt', 'omuz', 'kol'] },
    { focus: 'Alt Vücut & Karın', groups: ['bacak', 'karın', 'tüm vücut'] },
  ],
  3: [
    { focus: 'İtiş (Göğüs, Omuz, Kol)', groups: ['göğüs', 'omuz', 'kol'] },
    { focus: 'Çekiş (Sırt, Kol)', groups: ['sırt', 'kol'] },
    { focus: 'Bacak & Karın', groups: ['bacak', 'karın'] },
  ],
  4: [
    { focus: 'Göğüs & Kol', groups: ['göğüs', 'kol'] },
    { focus: 'Sırt', groups: ['sırt'] },
    { focus: 'Bacak & Karın', groups: ['bacak', 'karın'] },
    { focus: 'Omuz & Kardiyo', groups: ['omuz', 'tüm vücut'] },
  ],
  5: [
    { focus: 'Göğüs', groups: ['göğüs'] },
    { focus: 'Sırt', groups: ['sırt'] },
    { focus: 'Bacak', groups: ['bacak'] },
    { focus: 'Omuz & Kol', groups: ['omuz', 'kol'] },
    { focus: 'Karın & Kardiyo', groups: ['karın', 'tüm vücut'] },
  ],
  6: [
    { focus: 'Göğüs', groups: ['göğüs'] },
    { focus: 'Sırt', groups: ['sırt'] },
    { focus: 'Bacak', groups: ['bacak'] },
    { focus: 'Omuz', groups: ['omuz'] },
    { focus: 'Kol', groups: ['kol'] },
    { focus: 'Karın & Kardiyo', groups: ['karın', 'tüm vücut'] },
  ],
  7: [
    { focus: 'Göğüs', groups: ['göğüs'] },
    { focus: 'Sırt', groups: ['sırt'] },
    { focus: 'Bacak', groups: ['bacak'] },
    { focus: 'Omuz', groups: ['omuz'] },
    { focus: 'Kol', groups: ['kol'] },
    { focus: 'Karın', groups: ['karın'] },
    { focus: 'Kardiyo', groups: ['tüm vücut'] },
  ],
};

export function buildWorkoutPlan(
  allExercises: ExerciseLite[],
  goal: GoalType,
  weeklyDays: number,
): WorkoutDay[] {
  // 1) Hedefe uygun egzersizleri filtrele
  const suitable = allExercises.filter((e) => {
    if (goal === 'gain') return e.goalType === 'gain' || e.goalType === 'both';
    if (goal === 'lose') return e.goalType === 'lose' || e.goalType === 'both';
    return true; // maintain → hepsi
  });

  // 2) Gün sayısını 1-7 arasına sabitle, split seç
  const days = Math.min(Math.max(weeklyDays, 1), 7);
  const split = SPLITS[days];

  // 3) Her gün için, o günün bölgelerinden egzersiz seç
  return split.map((dayPlan, index) => {
    const dayExercises: ExerciseLite[] = [];
    for (const group of dayPlan.groups) {
      const groupExs = suitable.filter((e) => e.muscleGroup === group);
      // Her bölgeden en fazla 2 egzersiz al (program şişmesin)
      dayExercises.push(...groupExs.slice(0, 2));
    }
    return {
      day: index + 1,
      focus: dayPlan.focus,
      exercises: dayExercises,
    };
  });
}
// ─────────────────────────────────────────────────────────
// Sağlık uyarıları (yumuşak — engellemez, bilgilendirir)
// ─────────────────────────────────────────────────────────

// Sağlıklı VKİ aralığı (Dünya Sağlık Örgütü)
const BMI_MIN = 18.5;
const BMI_MAX = 24.9;

// Verilen kiloya göre VKİ hesapla
function bmiFor(weightKg: number, heightCm: number): number {
  return weightKg / ((heightCm / 100) ** 2);
}

export interface HealthWarning {
  type: 'target_too_low' | 'target_too_high' | 'no_meaningful_change';
  message: string;
}

export function buildWarnings(p: ProfileInput): HealthWarning[] {
  const warnings: HealthWarning[] = [];

  // Hedef kilonun VKİ'si
  const targetBmi = bmiFor(p.targetWeightKg, p.heightCm);

  // Sağlıklı aralığa denk gelen kilo sınırlarını da hesaplayalım (kullanıcıya somut sayı vermek için)
  const heightM = p.heightCm / 100;
  const healthyMinKg = +(BMI_MIN * heightM * heightM).toFixed(1);
  const healthyMaxKg = +(BMI_MAX * heightM * heightM).toFixed(1);

  // 1) Hedef VKİ çok düşük
  if (targetBmi < BMI_MIN) {
    warnings.push({
      type: 'target_too_low',
      message: `Hedef kilonuz (${p.targetWeightKg} kg) sağlıklı aralığın altında. ` +
        `Boyunuz için sağlıklı aralık yaklaşık ${healthyMinKg}–${healthyMaxKg} kg. ` +
        `Bir sağlık uzmanına danışmanızı öneririz.`,
    });
  }

  // 2) Hedef VKİ çok yüksek
  if (targetBmi > BMI_MAX) {
    warnings.push({
      type: 'target_too_high',
      message: `Hedef kilonuz (${p.targetWeightKg} kg) sağlıklı aralığın üstünde. ` +
        `Boyunuz için sağlıklı aralık yaklaşık ${healthyMinKg}–${healthyMaxKg} kg. ` +
        `Bir sağlık uzmanına danışmanızı öneririz.`,
    });
  }

  // 3) Anlamlı bir değişim yok
  if (Math.abs(p.targetWeightKg - p.weightKg) < 1) {
    warnings.push({
      type: 'no_meaningful_change',
      message: `Hedef kilonuz mevcut kilonuza çok yakın. ` +
        `Kilo değişimi yerine mevcut formu koruma programı daha uygun olabilir.`,
    });
  }

  return warnings;
}