export const PROGRAM_CATEGORIES = [
  'full_body', 'push', 'pull', 'upper_body', 'lower_body_abs',
  'chest', 'chest_arm', 'back', 'leg', 'leg_abs',
  'shoulder', 'shoulder_arm', 'shoulder_cardio',
  'arm', 'abs', 'abs_cardio', 'cardio',
] as const;

export type ProgramCategory = typeof PROGRAM_CATEGORIES[number];

export const PROGRAM_CATEGORY_LABELS: Record<ProgramCategory, string> = {
  full_body: 'Full Body',
  push: 'Push',
  pull: 'Pull',
  upper_body: 'Üst Vücut',
  lower_body_abs: 'Alt Vücut & Karın',
  chest: 'Göğüs',
  chest_arm: 'Göğüs-Kol',
  back: 'Sırt',
  leg: 'Bacak',
  leg_abs: 'Bacak-Karın',
  shoulder: 'Omuz',
  shoulder_arm: 'Omuz-Kol',
  shoulder_cardio: 'Omuz-Kardiyo',
  arm: 'Kol',
  abs: 'Karın',
  abs_cardio: 'Karın-Kardiyo',
  cardio: 'Kardiyo',
};

// Temel bölge/anahtar kelime grupları — hem Türkçe (kural tabanlı üreticiden) hem
// İngilizce/eş anlamlı (serbest metin üreten AI çıktılarından) terimleri kapsar.
const CHEST = ['göğüs', 'chest'];
const BACK = ['sırt', 'back'];
const LEG = ['bacak', 'leg'];
const SHOULDER = ['omuz', 'shoulder'];
const ARM = ['kol', 'triceps', 'biceps', 'pazı', 'arm'];
const ABS = ['karın', 'abs', 'core'];
const CARDIO = ['kardiyo', 'cardio'];

// a listesindeki her kelimeyi b listesindeki her kelimeyle eşleyip AND-grupları üretir
// (ör. cross(CHEST, ARM) → [['göğüs','kol'], ['göğüs','triceps'], ..., ['chest','arm']])
function cross(a: string[], b: string[]): string[][] {
  const pairs: string[][] = [];
  for (const x of a) for (const y of b) pairs.push([x, y]);
  return pairs;
}

// Her kelimeyi kendi başına yeterli sayan tekli AND-grupları üretir (OR gibi davranır)
function single(words: string[]): string[][] {
  return words.map((w) => [w]);
}

// Her kural bir kategoriye eşlenir; bir kuralın eşleşmesi için kelime gruplarından
// en az birindeki TÜM anahtar kelimelerin metinde geçmesi gerekir (AND içinde, OR arasında).
// Sıra önemli: daha spesifik/bileşik kurallar, kendilerini oluşturan tekli kurallardan önce gelir
// (ör. "Bacak & Karın" leg_abs'a düşsün, sadece leg'e değil).
const CATEGORY_RULES: [ProgramCategory, string[][]][] = [
  ['push', single(['itiş', 'push'])],
  ['pull', single(['çekiş', 'pull'])],
  ['full_body', single(['tüm vücut', 'full body'])],
  ['upper_body', single(['üst vücut', 'upper body'])],
  ['lower_body_abs', single(['alt vücut', 'lower body'])],
  ['chest_arm', cross(CHEST, ARM)],
  ['leg_abs', cross(LEG, ABS)],
  ['shoulder_arm', cross(SHOULDER, ARM)],
  ['shoulder_cardio', cross(SHOULDER, CARDIO)],
  ['abs_cardio', cross(ABS, CARDIO)],
  ['leg', single(LEG)],
  ['shoulder', single(SHOULDER)],
  ['chest', single(CHEST)],
  ['back', single(BACK)],
  ['arm', single(ARM)],
  ['abs', single(ABS)],
  ['cardio', single(CARDIO)],
];

// Serbest metin bir "focus" ifadesini (ör. "Göğüs & Kol") sabit kategori setine eşler
export function mapFocusToCategory(focus: string): ProgramCategory {
  // Türkçe "İ" harfi locale'siz toLowerCase() ile yanlış küçültülür (İ → i̇, düz "i" değil),
  // bu da 'itiş' gibi anahtar kelimelerin hiç eşleşmemesine yol açar — 'tr' locale'i şart.
  const f = (focus || '').toLocaleLowerCase('tr');
  for (const [category, keywordSets] of CATEGORY_RULES) {
    if (keywordSets.some((set) => set.every((k) => f.includes(k)))) return category;
  }
  return 'full_body';
}
