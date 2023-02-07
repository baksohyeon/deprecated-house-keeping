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

@Index(['houseId', 'userId'], { unique: true })
@Entity({ schema: 'housekeeping', name: 'houseMember' })
export class HouseMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  houseId: string;

  @Column()
  @Index()
  userId: string;

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
