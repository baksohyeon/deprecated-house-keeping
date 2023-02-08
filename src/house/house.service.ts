import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHouseDto } from 'src/dto/create-house.dto';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(HouseMember)
    private readonly houseMemberRepository: Repository<HouseMember>,
  ) {}

  async createNewHouse(createHouseDto: CreateHouseDto, user: User) {
    const houseEntity = this.houseRepository.create({
      name: createHouseDto.houseName,
    });
    const house = await this.houseRepository.save(houseEntity);

    const houseMemberEntity = new HouseMember();
    Object.assign(houseMemberEntity, {
      house,
      user,
      role: 'Admin',
      backlog: 'No Tasks',
    });
    const houseMember = await this.houseMemberRepository.save(
      houseMemberEntity,
    );
    return houseMember;
  }
}
