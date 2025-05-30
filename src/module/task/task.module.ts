import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { Housework } from 'src/entities/housework.entity';
import { User } from 'src/entities/user.entity';
import { HouseMember } from 'src/entities/houseMember.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Housework, User, HouseMember])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
