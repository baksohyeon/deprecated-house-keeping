import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { CreateHouseDto } from 'src/dto/create-house.dto';
import { User } from 'src/entities/user.entity';
import { HouseService } from './house.service';

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
    return await this.houseService.getAllHouseContainsUser(user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('/:houseId')
  async getHouseByHouseId(@Param('houseId') houseId: number) {
    return this.houseService.getHouseByHouseId(houseId);
  }
}
