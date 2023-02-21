import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('house/:houseId/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Post('/create')
  async create(
    @Param('houseId') houseId: number,
    @Body() createTaskDto: CreateTaskDto,
    @RequestUser() user: User,
  ) {
    return this.taskService.create(houseId, createTaskDto, user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get()
  async findAll(@Param('houseId', ParseIntPipe) houseId: number) {
    return this.taskService.findAllTasksByHouse(houseId);
  }
  @UseGuards(AuthGuard('jwt-access'))
  @Get('/assigned')
  async findOne(
    @Param('houseId', ParseIntPipe) houseId: number,
    @RequestUser() user: User,
  ) {
    return this.taskService.getAssignedTasksAndCount(houseId, user.id);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('/:taskId')
  async getAssignedTasksAndCount(
    @Param('houseId', ParseIntPipe) houseId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.findOne(houseId, taskId);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Put('/update')
  async update(
    @Param('houseId') houseId: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @RequestUser() user: User,
  ) {
    return this.taskService.update(houseId, updateTaskDto, user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':taskId')
  async remove(
    @Param('houseId') houseId: number,
    @Param('taskId') taskId: number,
  ) {
    return this.taskService.softDelete(houseId, taskId);
  }
}
