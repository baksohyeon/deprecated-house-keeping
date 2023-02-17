import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { MemberService } from './member.service';

@Controller('house/:houseId/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  @UseGuards(AuthGuard('jwt-access'))
  @Post('/invite')
  async inviteMember(
    @Param('houseId') houseId: number,
    @Body() createInvitationDto: CreateInvitationDto,
    @RequestUser() user: User,
  ) {
    return this.memberService.inviteMember(createInvitationDto, user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post('/invite/join')
  async joinMember(
    @Body() updateInvitationDto: UpdateInvitationDto,
    @RequestUser() user: User,
  ) {
    return this.memberService.acceptInvitation(updateInvitationDto, user);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post('/invite/decline')
  async declineInvitation(
    @Body() updateInvitationDto: UpdateInvitationDto,
    @RequestUser() user: User,
  ) {
    return this.memberService.declineInvitation(updateInvitationDto, user);
  }
}
