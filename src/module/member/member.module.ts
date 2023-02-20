import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Invitation } from 'src/entities/invitation.entity';
import { User } from 'src/entities/user.entity';
import { HouseModule } from 'src/module/house/house.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([HouseMember, House, Invitation, User])],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
