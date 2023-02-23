import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/enum/role.enum';
import { Status } from 'src/entities/enum/status.enum';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Invitation } from 'src/entities/invitation.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { HouseService } from 'src/module/house/house.service';
import { Repository } from 'typeorm';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(HouseMember)
    private readonly houseMemberRepository: Repository<HouseMember>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async inviteMember(createInvitationDto: CreateInvitationDto, user: User) {
    try {
      const recieverUser = await this.userRepository.findOneOrFail({
        where: {
          email: createInvitationDto.receiverEmail,
        },
      });
      await this.validateInvitation(
        user.id,
        createInvitationDto.houseId,
        recieverUser.id,
      );

      const invitationObject = this.invitationRepository.create({
        senderUserId: user.id,
        receiverUserId: recieverUser.id,
        houseId: createInvitationDto.houseId,
        status: Status.Pending,
      });

      const invitation = this.invitationRepository.save(invitationObject);
      return invitation;
    } catch (e) {
      return `${e.name}: ${e.message}`;
    }
  }

  private async validateInvitation(
    senderUserId: string,
    houseId: number,
    recieverUserId: string,
  ) {
    // 초대를 요청한 유저가 해당 house의 멤버가 아닐 경우 에러 발생
    await this.houseMemberRepository.findOneOrFail({
      where: {
        userId: senderUserId,
        houseId: houseId,
      },
    });

    // house 가 존재하지 않는 경우 에러 발생
    await this.houseRepository.findOneByOrFail({
      id: houseId,
    });

    // 초대받은 유저가 이미 house의 멤버일 경우 에러 발생
    const isAlreadyMember = this.houseMemberRepository.findOneBy({
      userId: recieverUserId,
      houseId: houseId,
    });

    if (isAlreadyMember) {
      throw new NotAcceptableException(
        'The invited user is already member of the house ',
      );
    }

    // 요청을 기다리는 초대가 있을 경우 에러 발생
    const isExistPendingInvitation =
      await this.invitationRepository.findOneOrFail({
        where: {
          houseId: houseId,
          receiverUserId: recieverUserId,
          status: Status.Pending,
        },
      });

    if (isExistPendingInvitation) {
      throw new NotAcceptableException('Already Requested Invitation');
    }
  }

  async acceptInvitation(updateInvitationDto: UpdateInvitationDto, user: User) {
    try {
      if (updateInvitationDto.status !== Status.Accepted) {
        throw new BadRequestException();
      }

      const house = await this.isValidInvitationReturnHouse(
        updateInvitationDto.invitationId,
        user.id,
      );

      const houseMemberObject = this.houseMemberRepository.create({
        house,
        user,
        role: Role.Member,
      } as Partial<HouseMember>);
      await this.updateInvitation(updateInvitationDto, user);
      return await this.houseMemberRepository.save(houseMemberObject);
    } catch (e) {
      throw `${e.name}: ${e.message}`;
    }
  }

  private async isValidInvitationReturnHouse(
    invitationId: number,
    userId: string,
  ) {
    const invitation = await this.invitationRepository.findOneByOrFail({
      id: invitationId,
    });

    if (invitation.receiverUserId !== userId) {
      throw new NotAcceptableException();
    }

    const house = await this.houseRepository.findOneOrFail({
      where: {
        id: invitation.houseId,
      },
    });

    const isAlreadyExistMember = await this.houseMemberRepository.findOne({
      where: {
        houseId: house.id,
        userId: userId,
      },
    });

    if (isAlreadyExistMember) {
      throw new NotAcceptableException();
    }
    return house;
  }

  async declineInvitation(
    updateInvitationDto: UpdateInvitationDto,
    user: User,
  ) {
    if (updateInvitationDto.status !== Status.Declined) {
      throw new BadRequestException();
    }
    return this.updateInvitation(updateInvitationDto, user);
  }

  async softDeleteMember(
    houseId: number,
    deletedUserId: string,
    requestUserId: string,
  ) {
    const isAdmin = await this.houseMemberRepository.findOneBy({
      userId: requestUserId,
      role: Role.Admin,
      houseId: houseId,
    });
    const isMember = await this.houseMemberRepository.findOneBy({
      userId: requestUserId,
      role: Role.Member,
      houseId,
    });

    // 삭제 대상 유저가 멤버인지 확인한다.
    const deleteUser = await this.houseMemberRepository.findOneByOrFail({
      userId: deletedUserId,
      houseId,
    });

    // TODO: 삭제 대상 유저가 Admin 인 경우 삭제 불가능하게 만들기

    if (isAdmin || isMember) {
      await this.houseMemberRepository.softRemove(deleteUser);
      return {
        Status: HttpStatus.ACCEPTED,
      };
    } else {
      throw new NotAcceptableException('유효하지 않는 요청입니다.');
    }
  }

  private async updateInvitation(
    updateInvitationDto: UpdateInvitationDto,
    user: User,
  ) {
    return this.invitationRepository.update(
      { id: updateInvitationDto.invitationId, receiverUserId: user.id },
      {
        status: updateInvitationDto.status,
      },
    );
  }

  async isValidHouseMember(houseId: number, userId: string) {
    const house = await this.houseRepository.findOne({
      where: {
        id: houseId,
      },
    });
    const member = await this.houseMemberRepository.findOne({
      where: {
        userId,
        houseId,
      },
    });
    if (!house) {
      throw new NotFoundException('요청한 그룹이 존재하지 않습니다.');
    }

    if (!member) {
      return false;
    }

    return true;
  }
}
