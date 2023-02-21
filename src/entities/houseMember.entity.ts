import { Role } from 'src/entities/enum/role.enum';
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
  role: Role;

  @Column({ nullable: false })
  @Index()
  houseId: number;

  @Column({ nullable: false })
  @Index()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
