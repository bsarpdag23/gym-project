import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutProgramDto } from './create-workout-program.dto';

export class UpdateWorkoutProgramDto extends PartialType(CreateWorkoutProgramDto) {}