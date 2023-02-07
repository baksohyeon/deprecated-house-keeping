import { Body, Controller, Post } from '@nestjs/common';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { HouseService } from './house.service';

@Controller('house')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @Post('/create')
  async createHouse(@Body() houseName: string, @RequestUser() userId: string) {
    return await this.houseService.createNewHouse('House name', userId);
  }
}
