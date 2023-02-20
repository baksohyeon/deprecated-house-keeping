import {
  Body,
  Controller,
  Delete,
  Get,
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
    return await this.houseService.getAllHouseByUser(user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('/:houseId')
  async getHouseByHouseId(@Param('houseId') houseId: number) {
    return this.houseService.getHouseByHouseId(houseId);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Put('/:houseId/update')
  async renameHouse(
    @Param('houseId') houseId: number,
    @Body() updateHouseDto: UpdateHouseDto,
  ) {
    return this.houseService.renameHouse(houseId, updateHouseDto);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete('/:houseId')
  async deleteHouse(@Param('houseId') houseId: number) {
    await this.houseService.softDeleteHouse(houseId);
    return {
      staus: 201,
    };
  }
}
