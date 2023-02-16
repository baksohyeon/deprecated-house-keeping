import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from './enum/status.enum';

@Entity({ schema: 'housekeeping' })
export class Invitaion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  senderUserId: string;

  @Column('uuid')
  recieverUserId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'decline'],
    default: Status.Pending,
  })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
