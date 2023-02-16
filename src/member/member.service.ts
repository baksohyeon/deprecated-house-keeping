import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from 'src/entities/enum/status.enum';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Invitation } from 'src/entities/invitation.entity';
import { User } from 'src/entities/user.entity';
import { HouseService } from 'src/house/house.service';
import { Repository } from 'typeorm';
import { CreateInvitationDto } from './dto/create-invitation.dto';

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

  async inviteMember(
    houseId: number,
    createInvitationDto: CreateInvitationDto,
    user: User,
  ) {
    try {
      const recievedUser = await this.userRepository.findOneByOrFail({
        email: createInvitationDto.receiverEmail,
      });

      const isExistMember = await this.houseMemberRepository.findOne({
        where: {
          houseId: houseId,
          userId: recievedUser.id,
        },
      });

      if (isExistMember) {
        throw new NotAcceptableException('Already exists member');
      }
      await this.houseRepository.findOneByOrFail({
        id: houseId,
      });

      const invitationObject = this.invitationRepository.create({
        senderUserId: user.id,
        receiverUserId: recievedUser.id,
        houseId,
        status: Status.Pending,
      } satisfies Partial<Invitation>);
      const invitation = this.invitationRepository.save(invitationObject);
      return invitation;
    } catch (e) {
      return `${e.name}: ${e.message}`;
    }
  }

  async createNewMember(houseId: number, user: User) {
    const house = await this.houseRepository.findOneOrFail({
      where: {
        id: houseId,
      },
    });
    const isExistMember = await this.houseMemberRepository.findOne({
      where: {
        houseId: houseId,
        user,
      },
    });
    if (isExistMember) {
      throw new NotFoundException();
    }
    const houseMemberObject = this.houseMemberRepository.create({
      house,
      user,
      role: 'Member',
      backlog: 'No Tasks',
    } as Partial<HouseMember>);
    return await this.houseMemberRepository.save(houseMemberObject);
  }
}
