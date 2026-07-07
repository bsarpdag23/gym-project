// src/app.module.ts
import { ConfigModule } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { User }           from './users/entities/user.entity';
import { MembershipPlan } from './membership-plans/entities/membership-plan.entity';
import { Enrollment }     from './enrollments/entities/enrollment.entity';
import { Exercise }       from './exercises/entities/exercise.entity';
import { WorkoutProgram } from './workout-programs/entities/workout-program.entity';

import { AuthController }            from './auth/auth.controller';
import { AuthService }               from './auth/auth.service';
import { JwtStrategy }               from './auth/strategies/jwt.strategy';

import { MembershipPlansController } from './membership-plans/membership-plans.controller';
import { MembershipPlansService }    from './membership-plans/membership-plans.service';

import { EnrollmentsController }     from './enrollments/enrollments.controller';
import { EnrollmentsService }        from './enrollments/enrollments.service';

import { ExercisesController }       from './exercises/exercises.controller';
import { ExercisesService }          from './exercises/exercises.service';

import { WorkoutProgramsController } from './workout-programs/workout-programs.controller';
import { WorkoutProgramsService }    from './workout-programs/workout-programs.service';

import { UsersController } from './users/users.controller';
import { UsersService }    from './users/users.service';

import { HealthProfile } from './health-profiles/entities/health-profile.entity';
import { HealthProfilesController } from './health-profiles/health-profiles.controller';
import { HealthProfilesService } from './health-profiles/health-profiles.service';

import { ProgramsController } from './programs/programs.controller';
import { ProgramsService } from './programs/programs.service';

import { FitnessProgram } from './programs/entities/fitness-program.entity';

import { CheckIn } from './check-ins/entities/check-in.entity';

import { CheckInsController } from './check-ins/check-ins.controller';
import { CheckInsService } from './check-ins/check-ins.service';

import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

import { AiProgramService } from './programs/ai-program.service';

import { Gym } from './gyms/entities/gym.entity';
import { GymsController } from './gyms/gyms.controller';
import { GymsService } from './gyms/gyms.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, MembershipPlan, Enrollment, Exercise, WorkoutProgram, HealthProfile, FitnessProgram, CheckIn, Gym],
      synchronize: true,         // Tabloları otomatik oluşturur (dev için)
      logging: false,
    }),
    TypeOrmModule.forFeature([User, MembershipPlan, Enrollment, Exercise, WorkoutProgram, HealthProfile, FitnessProgram, CheckIn, Gym]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    AuthController,
    MembershipPlansController,
    EnrollmentsController,
    ExercisesController,
    WorkoutProgramsController,
    UsersController,
    HealthProfilesController,
    ProgramsController,
    CheckInsController,
    DashboardController,
    GymsController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    MembershipPlansService,
    EnrollmentsService,
    ExercisesService,
    WorkoutProgramsService,
    UsersService,
    HealthProfilesService,
    ProgramsService,
    CheckInsService,
    DashboardService,
    AiProgramService,
    GymsService,
  ],
})
export class AppModule {}