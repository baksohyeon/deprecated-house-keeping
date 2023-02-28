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
import { InjectUserToParam } from 'src/validators/decorator/inject.user.decorator';
import { HouseParams } from 'src/validators/validated-params/house.params';
import { HouseTaskParams } from 'src/validators/validated-params/house-task.params';

@Controller('house/:houseId/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Post('/create')
  async create(
    @Param() houseParam: HouseParams,
    @Body() createTaskDto: CreateTaskDto,
    @RequestUser() user: User,
  ) {
    return this.taskService.create(houseParam.houseId, createTaskDto, user);
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Get()
  async findAll(@Param() houseParam: HouseParams) {
    return this.taskService.findAllTasksByHouse(houseParam.houseId);
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Get('/assigned')
  async findOne(@Param() houseParam: HouseParams, @RequestUser() user: User) {
    return this.taskService.getAssignedTasksAndCount(
      houseParam.houseId,
      user.id,
    );
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Get('/:taskId')
  async getAssignedTasksAndCount(@Param() houseTaskParams: HouseTaskParams) {
    return this.taskService.findOne(
      houseTaskParams.houseId,
      houseTaskParams.taskId,
    );
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Put('/update')
  async update(
    @Param() houseParam: HouseParams,
    @Body() updateTaskDto: UpdateTaskDto,
    @RequestUser() user: User,
  ) {
    return this.taskService.update(houseParam.houseId, updateTaskDto, user);
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':taskId')
  async remove(@Param() houseTaskParams: HouseTaskParams) {
    return this.taskService.softDelete(
      houseTaskParams.houseId,
      houseTaskParams.taskId,
    );
  }
}
