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
import { CreateHouseworkDto } from './dto/createHousework.dto';
import { DeleteHouseWorkDto } from './dto/deleteHouseWork.dto';
import { UpdateHouseworkDto } from './dto/updateHousework.dto';
import { HouseworkService } from './housework.service';

@Controller('house/:houseId/housework')
export class HouseworkController {
  constructor(private readonly houseWorkService: HouseworkService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Get()
  async getAllHouseworks(@Param('houseId') houseId: number) {
    return this.houseWorkService.getAllHouseworks(houseId);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get(':id')
  async getHouseworkById(
    @Param('houseId') houseId: number,
    @Param('id') houseworkId: number,
  ) {
    return this.houseWorkService.getHouseworkById(houseId, houseworkId);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post('/create')
  async createHousework(
    @Param('houseId') houseId: number,
    @Body() createHouseworkDto: CreateHouseworkDto,
  ) {
    return this.houseWorkService.createHousework(houseId, createHouseworkDto);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete()
  async softDeleteHousework(
    @Param('houseId') houseId: number,
    @Body() deleteHouseworkDto: DeleteHouseWorkDto,
  ) {
    return this.houseWorkService.softDeleteHousework(
      houseId,
      deleteHouseworkDto,
    );
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Put('/update')
  async updateHousework(
    @Param('houseId') houseId: number,
    @Body() updateHouseworkDto: UpdateHouseworkDto,
  ) {
    return this.houseWorkService.updateHousework(houseId, updateHouseworkDto);
  }
}
