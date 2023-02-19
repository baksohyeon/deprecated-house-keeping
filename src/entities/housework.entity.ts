import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { House } from './house.entity';
import { Task } from './task.entity';

@Entity({ schema: 'housekeeping' })
export class Housework {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Task, (task) => task.housework)
  tasks: Task[];

  @Column({ type: 'varchar' })
  title: string;

  @Column()
  frequency: number;

  @Column()
  houseId: number;

  @ManyToOne(() => House, (house) => house.houseworks)
  house: House;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
