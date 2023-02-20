import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HouseMember } from './houseMember.entity';
import { Task } from './task.entity';

@Entity({ schema: 'housekeeping' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => HouseMember, (houseMember) => houseMember.user, {
    cascade: ['soft-remove'],
  })
  housemembers: HouseMember[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
