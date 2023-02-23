import {
  BadRequestException,
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
      // TODO: 이미 존재하는 요청인 경우, 에러 요청

      const recievedUser = await this.userRepository.findOneByOrFail({
        email: createInvitationDto.receiverEmail,
      });

      await this.houseRepository.findOneByOrFail({
        id: createInvitationDto.houseId,
      });

      const isAlreadyRequested = await this.invitationRepository.findOne({
        where: {
          houseId: createInvitationDto.houseId,
          receiverUserId: recievedUser.id,
        },
      });

      if (isAlreadyRequested) {
        throw new NotAcceptableException('Already Requested Invitation');
      }

      const isExistMember = await this.houseMemberRepository.findOne({
        where: {
          houseId: createInvitationDto.houseId,
          userId: recievedUser.id,
        },
      });

      if (isExistMember) {
        throw new NotAcceptableException('Already Exists Member');
      }

      const invitationObject = this.invitationRepository.create({
        senderUserId: user.id,
        receiverUserId: recievedUser.id,
        houseId: createInvitationDto.houseId,
        status: Status.Pending,
      } satisfies Partial<Invitation>);
      const invitation = this.invitationRepository.save(invitationObject);
      return invitation;
    } catch (e) {
      return `${e.name}: ${e.message}`;
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

  async declineInvitation(
    updateInvitationDto: UpdateInvitationDto,
    user: User,
  ) {
    if (updateInvitationDto.status !== Status.Declined) {
      throw new BadRequestException();
    }
    return this.updateInvitation(updateInvitationDto, user);
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
    if (userId && Number.isInteger(houseId)) {
      const house = await this.houseMemberRepository.findOne({
        where: {
          userId,
          houseId,
        },
      });
      if (!house) {
        return false;
      }
      return true;
    } else {
      return false;
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
}
