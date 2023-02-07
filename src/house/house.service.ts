import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(HouseMember)
    private readonly houseMemberRepository: Repository<HouseMember>,
  ) {}

  async createNewHouse(houseName: string, userId: string) {
    const houseEntity = this.houseRepository.create({ name: houseName });
    const house = await this.houseRepository.save(houseEntity);

    const houseMemberEntity = new HouseMember();
    Object.assign(houseMemberEntity, {
      houseId: house.id,
      userId,
      role: 'Admin',
      backlog: 'No Tasks',
    });
    const houseMember = await this.houseMemberRepository.save(
      houseMemberEntity,
    );
    return houseMember;
  }
}
