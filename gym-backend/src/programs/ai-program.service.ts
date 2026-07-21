import { Injectable, BadRequestException } from '@nestjs/common';
// import { GoogleGenerativeAI } from '@google/generative-ai';   // ← Gemini (kredi açılınca geri alınacak)
import { ProfileInput, GoalType } from './fitness-calculator';

@Injectable()
export class AiProgramService {
  // ── GEMINI (devre dışı — prepay kredisi yüklendiğinde yorumdan çıkar) ──
  // private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  async generateWorkoutPlan(input: ProfileInput, goal: GoalType, weeklyDays: number) {
    const goalText = goal === 'gain' ? 'kilo alma (kas kütlesi artışı)'
                   : goal === 'lose' ? 'kilo verme (yağ yakımı)'
                   : 'formu koruma';

    // Prompt — AI'ya ne istediğimizi çok net anlatıyoruz
    const prompt = `Sen deneyimli bir fitness antrenörüsün. Aşağıdaki kişi için haftalık antrenman programı hazırla.

KİŞİ BİLGİLERİ:
- Boy: ${input.heightCm} cm, Kilo: ${input.weightKg} kg, Yaş: ${input.age}
- Cinsiyet: ${input.gender === 'male' ? 'Erkek' : 'Kadın'}
- Hedef: ${goalText}
- Haftalık antrenman günü: ${weeklyDays} gün

KURALLAR:
- Sadece ${weeklyDays} günlük program yap.
- Her gün için bir odak bölge ve o güne uygun egzersizler belirle.
- Her egzersiz için makul set ve tekrar sayısı ver (sağlıklı sınırlarda).
- Aşırı/sağlıksız yükleme yapma.

ÇOK ÖNEMLİ - ÇIKTI FORMATI:
Cevabını SADECE aşağıdaki JSON formatında ver. Başka hiçbir metin, açıklama veya markdown ekleme:

[
  {
    "day": 1,
    "focus": "Göğüs ve Triceps",
    "exercises": [
      { "name": "Bench Press", "sets": 4, "reps": 10, "muscleGroup": "göğüs" }
    ]
  }
]`;

    try {
      // ── GEMINI ÇAĞRISI (devre dışı — kredi yüklenince bu bloğu aç, Groq bloğunu yoruma al) ──
      // const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      // const result = await model.generateContent(prompt);
      // const text = result.response.text();

      // ── GROQ ÇAĞRISI (aktif) ──
      const text = await this.callGroq(prompt);

      // AI bazen ```json ... ``` ile sarar, temizle
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const plan = JSON.parse(cleaned);

      // Basit doğrulama: dizi mi, boş değil mi?
      if (!Array.isArray(plan) || plan.length === 0) {
        throw new Error('AI geçersiz format döndürdü');
      }
      return plan;
    } catch (err) {
      // AI başarısız olursa hata fırlat — çağıran taraf yedek plana düşecek
      throw new BadRequestException('AI program üretemedi: ' + err.message);
    }
  }

  // Yapay zeka ile diyet planı oluştur (öğünler, saatler ve malzemeler)
  async generateDietPlan(input: ProfileInput, goal: string, calories: number, macros: { proteinG: number; carbsG: number; fatG: number }) {
    const goalText = goal === 'gain' ? 'kilo alma (kas kütlesi artışı)'
                   : goal === 'lose' ? 'kilo verme (yağ yakımı)'
                   : 'formu koruma';

    // Öğün bazlı kalori ve makro dağılımı (Kahvaltı %25, Öğle %35, Akşam %30, Ara %10)
    const bfastCals = Math.round(calories * 0.25);
    const lunchCals = Math.round(calories * 0.35);
    const dinnerCals = Math.round(calories * 0.30);
    const snackCals = calories - (bfastCals + lunchCals + dinnerCals);

    const bfastP = Math.round(macros.proteinG * 0.25);
    const lunchP = Math.round(macros.proteinG * 0.35);
    const dinnerP = Math.round(macros.proteinG * 0.30);
    const snackP = macros.proteinG - (bfastP + lunchP + dinnerP);

    const bfastC = Math.round(macros.carbsG * 0.25);
    const lunchC = Math.round(macros.carbsG * 0.35);
    const dinnerC = Math.round(macros.carbsG * 0.30);
    const snackC = macros.carbsG - (bfastC + lunchC + dinnerC);

    const bfastF = Math.round(macros.fatG * 0.25);
    const lunchF = Math.round(macros.fatG * 0.35);
    const dinnerF = Math.round(macros.fatG * 0.30);
    const snackF = macros.fatG - (bfastF + lunchF + dinnerF);

    const prompt = `Sen uzman bir spor diyetisyenisin. Aşağıdaki kişi için günlük örnek bir diyet ve beslenme programı hazırla.

KİŞİ BİLGİLERİ:
- Boy: ${input.heightCm} cm, Kilo: ${input.weightKg} kg, Yaş: ${input.age}
- Cinsiyet: ${input.gender === 'male' ? 'Erkek' : 'Kadın'}
- Hedef: ${goalText}
- GÜNLÜK TOPLAM HEDEF KALORİ: TAM OLARAK KESİNLİKLE ${calories} kcal
- GÜNLÜK TOPLAM MAKROLAR: Protein: ${macros.proteinG}g, Karbonhidrat: ${macros.carbsG}g, Yağ: ${macros.fatG}g

ÖĞÜN HEDEFLERİ (ÖĞÜNLERİN KALORİSİ VE MAKROLARI KESİNLİKLE BU SAYILARA SADIK OLMALIDIR):
1. Kahvaltı (Saat 08:00) -> Hedef: ${bfastCals} kcal (P: ${bfastP}g, K: ${bfastC}g, Y: ${bfastF}g)
2. Öğle Yemeği (Saat 13:00) -> Hedef: ${lunchCals} kcal (P: ${lunchP}g, K: ${lunchC}g, Y: ${lunchF}g)
3. Ara Öğün (Saat 16:00) -> Hedef: ${snackCals} kcal (P: ${snackP}g, K: ${snackC}g, Y: ${snackF}g)
4. Akşam Yemeği (Saat 19:00) -> Hedef: ${dinnerCals} kcal (P: ${dinnerP}g, K: ${dinnerC}g, Y: ${dinnerF}g)

ÇOK ÖNEMLİ KURALLAR:
- Tüm öğünlerin kalorilerini topladığında toplam sonuç KESİNLİKLE TAM OLARAK ${calories} kcal etmelidir.
- Her öğünün besin malzemelerini (gramaj, adet) o öğünün kalori ve makro hedefine tam uyacak miktarlarda yaz.
- Sağlıklı, bulunabilir ve pratik malzemeler öner.

ÇOK ÖNEMLİ - ÇIKTI FORMATI:
Cevabını SADECE aşağıdaki JSON formatında ver. Başka hiçbir açıklama, markdown veya metin ekleme:

{
  "meals": [
    {
      "name": "Kahvaltı",
      "time": "08:00",
      "items": [
        "3 adet haşlanmış yumurta",
        "50g süzme peynir",
        "1 dilim tam buğday ekmeği",
        "Domates, salatalık ve yeşillik"
      ],
      "calories": ${bfastCals},
      "macros": { "protein": ${bfastP}, "carbs": ${bfastC}, "fat": ${bfastF} }
    },
    {
      "name": "Öğle Yemeği",
      "time": "13:00",
      "items": [ "..." ],
      "calories": ${lunchCals},
      "macros": { "protein": ${lunchP}, "carbs": ${lunchC}, "fat": ${lunchF} }
    },
    {
      "name": "Ara Öğün",
      "time": "16:00",
      "items": [ "..." ],
      "calories": ${snackCals},
      "macros": { "protein": ${snackP}, "carbs": ${snackC}, "fat": ${snackF} }
    },
    {
      "name": "Akşam Yemeği",
      "time": "19:00",
      "items": [ "..." ],
      "calories": ${dinnerCals},
      "macros": { "protein": ${dinnerP}, "carbs": ${dinnerC}, "fat": ${dinnerF} }
    }
  ]
}`;

    try {
      const text = await this.callGroq(prompt);
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const plan = JSON.parse(cleaned);

      if (!plan || !Array.isArray(plan.meals)) {
        throw new Error('AI geçersiz format döndürdü');
      }
      return plan;
    } catch (err) {
      throw new BadRequestException('AI diyet programı üretemedi: ' + err.message);
    }
  }

  // ── Groq (Llama) API çağrısı — OpenAI uyumlu endpoint, SDK gerekmez ──
  private async callGroq(prompt: string): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq hatası: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }
}