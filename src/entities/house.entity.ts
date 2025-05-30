import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Housework } from './housework.entity';
import { HouseMember } from './houseMember.entity';

@Entity({ schema: 'housekeeping' })
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => HouseMember, (houseMember) => houseMember.house, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  houseMembers: HouseMember[];

  @OneToMany(() => Housework, (housework) => housework.house)
  houseworks: Housework[];
}
