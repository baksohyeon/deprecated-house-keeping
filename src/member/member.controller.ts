import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { MemberService } from './member.service';

@Controller('house/:houseId/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Post()
  async createMembers(
    @Param('houseId') houseId: number,
    @RequestUser() user: User,
  ) {
    return this.memberService.createNewMember(houseId, user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post('/invite')
  async inviteMember(
    @Param('houseId') houseId: number,
    @Body() createInvitationDto: CreateInvitationDto,
    @RequestUser() user: User,
  ) {
    return this.memberService.inviteMember(houseId, createInvitationDto, user);
  }
}
