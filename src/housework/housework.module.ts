import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from 'src/entities/house.entity';
import { Housework } from 'src/entities/housework.entity';
import { HouseworkController } from './housework.controller';
import { HouseworkService } from './housework.service';

@Module({
  imports: [TypeOrmModule.forFeature([House, Housework])],
  controllers: [HouseworkController],
  providers: [HouseworkService],
})
export class HouseworkModule {}
