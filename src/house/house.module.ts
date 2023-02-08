import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { HouseController } from './house.controller';
import { HouseService } from './house.service';

@Module({
  providers: [HouseService],
  controllers: [HouseController],
  imports: [TypeOrmModule.forFeature([House, HouseMember]), UserModule],
})
export class HouseModule {}
