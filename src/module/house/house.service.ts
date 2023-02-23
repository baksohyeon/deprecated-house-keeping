import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHouseDto } from 'src/module/house/dto/create-house.dto';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/module/user/user.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UpdateHouseDto } from './dto/update-house.dto';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { CreateHouseworkDto } from '../housework/dto/createHousework.dto';
import { Housework } from 'src/entities/housework.entity';
import { Role } from 'src/entities/enum/role.enum';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(HouseMember)
    private readonly houseMemberRepository: Repository<HouseMember>,
    private readonly dataSource: DataSource,
  ) {}

  async createNewHouse(
    createHouseDto: CreateHouseDto,
    user: User,
  ): Promise<HouseMember> {
    return await this.dataSource.transaction(
      async (manager: EntityManager): Promise<HouseMember> => {
        const houseEntity = manager.create(House, {
          name: createHouseDto.name,
        });
        const house = await manager.save(houseEntity);

        const houseMemberEntity = manager.create(HouseMember, {
          house,
          user,
          role: Role.Admin,
        });

        return manager.save(houseMemberEntity);
      },
    );
  }

  async getAllHouseByUser(user: User) {
    return this.houseMemberRepository.findBy({
      userId: user.id,
    });
  }

  async getHouseByHouseId(houseId: number) {
    try {
      return this.houseRepository.findOneOrFail({
        relations: {
          houseMembers: {
            user: true,
          },
        },
        where: {
          id: houseId,
        },
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
