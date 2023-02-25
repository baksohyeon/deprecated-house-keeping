import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from './enum/status.enum';
import { House } from './house.entity';
import { User } from './user.entity';

@Entity({ schema: 'housekeeping' })
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => User)
  @JoinColumn([
    { name: 'sender_user_id', referencedColumnName: 'id' },
    { name: 'receiver_user_id', referencedColumnName: 'id' },
  ])
  user: User;

  @ManyToOne((type) => House)
  @JoinColumn([{ name: 'house_id', referencedColumnName: 'id' }])
  house: House;

  @Column('uuid')
  senderUserId: string;

  @Column('uuid')
  receiverUserId: string;

  @Column()
  houseId: number;

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
