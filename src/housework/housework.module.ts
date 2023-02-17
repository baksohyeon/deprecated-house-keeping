import { Module } from '@nestjs/common';
import { HouseworkController } from './housework.controller';
import { HouseworkService } from './housework.service';

@Module({
  controllers: [HouseworkController],
  providers: [HouseworkService]
})
export class HouseworkModule {}
