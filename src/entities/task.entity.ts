import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'housekeeping' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  creatorUserId: string;

  @Column({ type: 'uuid' })
  assigneeUserId: string;

  @Column({ type: 'uuid' })
  assignerUserId: string;

  @Column({ type: 'boolean' })
  isCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
