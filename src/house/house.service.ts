import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHouseDto } from 'src/house/dto/create-house.dto';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { UpdateHouseDto } from './dto/update-house.dto';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { CreateHouseworkDto } from '../housework/dto/createHousework.dto';
import { Housework } from 'src/entities/housework.entity';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(HouseMember)
    private readonly houseMemberRepository: Repository<HouseMember>,
  ) {}

  async createNewHouse(
    createHouseDto: CreateHouseDto,
    user: User,
  ): Promise<HouseMember> {
    // TODO: 트랜잭션 붙이기
    const houseEntity = this.houseRepository.create({
      name: createHouseDto.name,
    });
    const house = await this.houseRepository.save(houseEntity);
    const houseMemberEntity = new HouseMember();
    Object.assign(houseMemberEntity, {
      house,
      user,
      role: 'Admin',
      backlog: 'No Tasks',
    } as Partial<HouseMember>);
    return this.houseMemberRepository.save(houseMemberEntity);
  }

  async getAllHouseByUser(user: User) {
    return this.houseMemberRepository.find({
      where: {
        user: { id: user.id },
      },
      relations: ['user', 'house'],
    });
  }

  async getHouseByHouseId(houseId: number) {
    try {
      return await this.houseRepository.findOneOrFail({
        relations: {
          houseMembers: true,
        },
        where: {
          id: houseId,
        },
        transaction: true,
      });
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  async renameHouse(houseId: number, updateHouseDto: UpdateHouseDto) {
    this.houseRepository.update(houseId, { name: updateHouseDto.houseName });
  }

  async softDeleteHouse(houseId: number) {
    const house = await this.getHouseByHouseId(houseId);
    await this.houseRepository.softRemove(house);
  }
}
