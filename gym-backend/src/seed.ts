// ─────────────────────────────────────────────────────────
// Egzersiz seed script'i — veritabanını örnek egzersizlerle doldurur.
// Çalıştırma:  npx ts-node src/seed.ts
// ─────────────────────────────────────────────────────────
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercises/entities/exercise.entity';

const EXERCISES: Partial<Exercise>[] = [
  // ── GÖĞÜS ──
  { name: 'Bench Press',        description: 'Barbell ile göğüs presi',        category: 'strength', muscleGroup: 'göğüs',  goalType: 'gain', equipment: 'Barbell',   sets: 4, reps: 8 },
  { name: 'Dumbbell Fly',       description: 'Dumbbell ile göğüs açış',        category: 'strength', muscleGroup: 'göğüs',  goalType: 'both', equipment: 'Dumbbell',  sets: 3, reps: 12 },
  { name: 'Push Up',            description: 'Vücut ağırlığıyla şınav',        category: 'strength', muscleGroup: 'göğüs',  goalType: 'lose', equipment: 'Yok',       sets: 3, reps: 15 },

  // ── SIRT ──
  { name: 'Deadlift',           description: 'Barbell ile ölü kaldırış',       category: 'strength', muscleGroup: 'sırt',   goalType: 'gain', equipment: 'Barbell',   sets: 4, reps: 6 },
  { name: 'Lat Pulldown',       description: 'Makinede sırt çekişi',           category: 'strength', muscleGroup: 'sırt',   goalType: 'both', equipment: 'Makine',    sets: 3, reps: 12 },
  { name: 'Pull Up',            description: 'Barfiks',                        category: 'strength', muscleGroup: 'sırt',   goalType: 'gain', equipment: 'Barfiks',   sets: 3, reps: 8 },

  // ── BACAK ──
  { name: 'Squat',              description: 'Barbell ile çömelme',            category: 'strength', muscleGroup: 'bacak',  goalType: 'gain', equipment: 'Barbell',   sets: 4, reps: 8 },
  { name: 'Leg Press',          description: 'Makinede bacak presi',           category: 'strength', muscleGroup: 'bacak',  goalType: 'both', equipment: 'Makine',    sets: 3, reps: 12 },
  { name: 'Lunges',             description: 'Öne adım çömelme',               category: 'strength', muscleGroup: 'bacak',  goalType: 'lose', equipment: 'Dumbbell',  sets: 3, reps: 12 },

  // ── OMUZ ──
  { name: 'Shoulder Press',     description: 'Dumbbell ile omuz presi',        category: 'strength', muscleGroup: 'omuz',   goalType: 'gain', equipment: 'Dumbbell',  sets: 4, reps: 10 },
  { name: 'Lateral Raise',      description: 'Yana omuz kaldırış',             category: 'strength', muscleGroup: 'omuz',   goalType: 'both', equipment: 'Dumbbell',  sets: 3, reps: 15 },

  // ── KOL ──
  { name: 'Bicep Curl',         description: 'Dumbbell ile biceps',            category: 'strength', muscleGroup: 'kol',    goalType: 'gain', equipment: 'Dumbbell',  sets: 3, reps: 12 },
  { name: 'Tricep Dips',        description: 'Triceps için dips',              category: 'strength', muscleGroup: 'kol',    goalType: 'both', equipment: 'Yok',       sets: 3, reps: 12 },

  // ── KARIN ──
  { name: 'Plank',              description: 'Karın için plank (saniye)',      category: 'balance',  muscleGroup: 'karın',  goalType: 'both', equipment: 'Yok',       sets: 3, reps: 60 },
  { name: 'Crunches',           description: 'Mekik',                          category: 'strength', muscleGroup: 'karın',  goalType: 'lose', equipment: 'Yok',       sets: 3, reps: 20 },

  // ── KARDİYO (kilo verme ağırlıklı) ──
  { name: 'Treadmill Run',      description: 'Koşu bandı (dakika)',            category: 'cardio',   muscleGroup: 'tüm vücut', goalType: 'lose', equipment: 'Koşu bandı', sets: 1, reps: 30 },
  { name: 'Jump Rope',          description: 'İp atlama (dakika)',             category: 'cardio',   muscleGroup: 'tüm vücut', goalType: 'lose', equipment: 'İp',        sets: 3, reps: 5 },
  { name: 'Burpees',            description: 'Tüm vücut patlayıcı hareket',    category: 'cardio',   muscleGroup: 'tüm vücut', goalType: 'lose', equipment: 'Yok',       sets: 3, reps: 15 },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get<Repository<Exercise>>(getRepositoryToken(Exercise));

  // Zaten seed edilmişse tekrar ekleme (isim bazlı kontrol)
  let added = 0;
  for (const ex of EXERCISES) {
    const exists = await repo.findOne({ where: { name: ex.name } });
    if (!exists) {
      await repo.save(repo.create(ex));
      added++;
    }
  }

  console.log(`✅ Seed tamamlandı. ${added} yeni egzersiz eklendi (toplam denenen: ${EXERCISES.length}).`);
  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});