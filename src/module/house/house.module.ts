import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { HouseController } from './house.controller';
import { HouseService } from './house.service';

@Module({
  imports: [TypeOrmModule.forFeature([House, HouseMember])],
  providers: [HouseService],
  controllers: [HouseController],
  exports: [HouseService],
})
export class HouseModule {}
