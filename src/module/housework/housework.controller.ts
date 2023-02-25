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
import { InjectUserToParam } from 'src/validators/decorator/inject.user.decorator';
import { HouseParams } from 'src/validators/validated-params/house.params';
import { CreateHouseworkDto } from './dto/createHousework.dto';
import { DeleteHouseWorkDto } from './dto/deleteHouseWork.dto';
import { UpdateHouseworkDto } from './dto/updateHousework.dto';
import { HouseworkService } from './housework.service';

@Controller('house/:houseId/housework')
export class HouseworkController {
  constructor(private readonly houseWorkService: HouseworkService) {}

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Get()
  async getAllHouseworks(@Param() validatedHouseParam: HouseParams) {
    return this.houseWorkService.getAllHouseworks(validatedHouseParam.houseId);
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Get(':id')
  async getHouseworkById(
    @Param() validatedHouseParam: HouseParams,
    @Param('id') houseworkId: number,
  ) {
    return this.houseWorkService.getHouseworkById(
      validatedHouseParam.houseId,
      houseworkId,
    );
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Post('/create')
  async createHousework(
    @Param() validatedHouseParam: HouseParams,
    @Body() createHouseworkDto: CreateHouseworkDto,
  ) {
    return this.houseWorkService.createHousework(
      validatedHouseParam.houseId,
      createHouseworkDto,
    );
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Delete()
  async softDeleteHousework(
    @Param() validatedHouseParam: HouseParams,
    @Body() deleteHouseworkDto: DeleteHouseWorkDto,
  ) {
    return this.houseWorkService.softDeleteHousework(
      validatedHouseParam.houseId,
      deleteHouseworkDto,
    );
  }

  @InjectUserToParam()
  @UseGuards(AuthGuard('jwt-access'))
  @Put('/update')
  async updateHousework(
    @Param() validatedHouseParam: HouseParams,
    @Body() updateHouseworkDto: UpdateHouseworkDto,
  ) {
    return this.houseWorkService.updateHousework(
      validatedHouseParam.houseId,
      updateHouseworkDto,
    );
  }
}
