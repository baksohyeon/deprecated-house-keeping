import { BackLog, HouseRole } from 'src/entities/enum/house-member.type';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { House } from './house.entity';
import { User } from './user.entity';

@Index(['house', 'user'], { unique: true })
@Entity({ schema: 'housekeeping', name: 'houseMember' })
export class HouseMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => House, (house) => house.houseMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'house_id' })
  house: House;

  @ManyToOne(() => User, (user) => user.housemembers)
  user: User;

  @Column({
    type: 'enum',
    enum: ['Admin', 'Member'],
    default: 'member',
  })
  role: HouseRole;

  @Column({ nullable: false })
  @Index()
  houseId: number;

  @Column({ nullable: false })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['Tasks To do', 'No Tasks'],
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
