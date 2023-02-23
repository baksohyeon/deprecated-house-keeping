import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { CreateHouseDto } from 'src/module/house/dto/create-house.dto';
import { User } from 'src/entities/user.entity';
import { HouseService } from './house.service';
import { UpdateHouseDto } from './dto/update-house.dto';
import { InjectUserToParam } from 'src/validators/decorator/inject.user.decorator';
import { HouseParams } from '../../validators/house-params';

@Controller('house')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Post('/create')
  async createHouse(
    @Body() createHouseDto: CreateHouseDto,
    @RequestUser() user: User,
  ) {
    return await this.houseService.createNewHouse(createHouseDto, user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('/all')
  async getHouses(@RequestUser() user: User) {
    return this.houseService.getAllHouseByUser(user);
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Get('/:houseId')
  async getHouseByHouseId(@Param() params: HouseParams) {
    return this.houseService.getHouseByHouseId(params.houseId);
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Put('/:houseId/update')
  async renameHouse(
    @Param() params: HouseParams,
    @Body() updateHouseDto: UpdateHouseDto,
  ) {
    await this.houseService.renameHouse(params.houseId, updateHouseDto);
    return {
      status: HttpStatus.ACCEPTED,
    };
  }
  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete('/:houseId')
  async deleteHouse(@Param() params: HouseParams) {
    await this.houseService.softDeleteHouse(params.houseId);
    return {
      staus: 201,
    };
  }
}
