import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user.user')
export class User {
  // TODO: user id 를 uuid로 저장하기
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
