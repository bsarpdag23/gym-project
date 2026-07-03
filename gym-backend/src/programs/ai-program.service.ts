import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileInput, GoalType } from './fitness-calculator';

@Injectable()
export class AiProgramService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  async generateWorkoutPlan(input: ProfileInput, goal: GoalType, weeklyDays: number) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
      const result = await model.generateContent(prompt);
      const text = result.response.text();

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
}