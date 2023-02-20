import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Housework } from './housework.entity';
import { User } from './user.entity';

@Entity({ schema: 'housekeeping' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Housework, (housework) => housework.tasks)
  housework: Housework;

  @Column({ type: 'uuid' })
  creatorUserId: string;

  @Column({ type: 'uuid' })
  assigneeUserId: string;

  @Column({ type: 'uuid' })
  assignerUserId: string;

  @ManyToOne((type) => User)
  @JoinColumn([
    { name: 'assigner_user_id', referencedColumnName: 'id' },
    { name: 'assignee_user_id', referencedColumnName: 'id' },
    { name: 'creator_user_id', referencedColumnName: 'id' },
  ])
  user: User;

  @Column()
  houseworkId: number;

  @Column({ type: 'boolean' })
  isCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
