import { BackLog, HouseRole } from 'src/interfaces/house-member.type';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { House } from './house.entity';
import { User } from './user.entity';

@Index(['house', 'user'], { unique: true })
@Entity({ schema: 'housekeeping', name: 'houseMember' })
export class HouseMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => House, (house) => house.houseMember)
  house: House;

  @ManyToOne(() => User, (user) => user.housemember)
  user: User;

  @Column({
    type: 'enum',
    enum: ['Admin', 'Member'],
    default: 'member',
  })
  role: HouseRole;

  @Column({
    type: 'enum',
    enum: ['Tasks to do', 'No tasks'],
    default: 'No tasks',
  })
  backlog: BackLog;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
