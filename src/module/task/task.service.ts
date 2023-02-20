import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Housework } from 'src/entities/housework.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Housework)
    private readonly houseworkRepository: Repository<Housework>,
  ) {}
  async create(houseId: number, createTaskDto: CreateTaskDto, user: User) {
    const housework = await this.houseworkRepository.findOne({
      where: {
        id: createTaskDto.houseworkId,
        houseId: houseId,
      },
    });

    const taskEntity = this.taskRepository.create({
      isCompleted: false,
      housework,
      creatorUserId: user.id,
    });

    if (createTaskDto.assigneeUserId) {
      const assignee = await this.userRepository.findOneOrFail({
        where: {
          id: createTaskDto.assigneeUserId,
          housemembers: {
            houseId,
          },
        },
        relations: {
          housemembers: true,
        },
      });
      taskEntity.assigneeUserId = assignee.id;
      taskEntity.assignerUserId = user.id;
    }

    return this.taskRepository.save(taskEntity);
  }

  async findAll(houseId: number) {
    return this.taskRepository.find({
      relations: {
        housework: {
          house: true,
        },
      },
      where: {
        housework: {
          houseId,
        },
      },
    });
  }

  findOne(houseId: number, taskId: number) {
    return this.taskRepository.findOneOrFail({
      relations: {
        housework: {
          house: true,
        },
      },
      where: {
        id: taskId,
        housework: {
          houseId,
        },
      },
    });
  }

  async update(houseId: number, updateTaskDto: UpdateTaskDto, user: User) {
    try {
      const housework = await this.houseworkRepository.findOne({
        where: {
          id: updateTaskDto.houseworkId,
          houseId: houseId,
        },
      });

      const taskEntity = this.taskRepository.create({
        id: updateTaskDto.taskId,
        isCompleted: updateTaskDto.isCompleted,
        housework,
      });

      if (updateTaskDto.assigneeUserId) {
        const assignee = await this.userRepository.findOneOrFail({
          where: {
            id: updateTaskDto.assigneeUserId,
            housemembers: {
              houseId,
            },
          },
          relations: {
            housemembers: true,
          },
        });
        taskEntity.assigneeUserId = assignee.id;
        taskEntity.assignerUserId = user.id;
      }

      return this.taskRepository.save(taskEntity);
    } catch (e) {
      return `${e.name}: ${e.message}`;
    }
  }

  async softDelete(houseId: number, taskId: number) {
    const task = await this.taskRepository.findOneOrFail({
      where: {
        id: taskId,
        housework: {
          id: houseId,
        },
      },
    });
    return this.taskRepository.softRemove(task);
  }
}
