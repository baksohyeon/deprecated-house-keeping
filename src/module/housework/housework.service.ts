import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { House } from 'src/entities/house.entity';
import { Housework } from 'src/entities/housework.entity';
import { Repository } from 'typeorm';
import { CreateHouseworkDto } from './dto/createHousework.dto';
import { DeleteHouseWorkDto } from './dto/deleteHouseWork.dto';
import { UpdateHouseworkDto } from './dto/updateHousework.dto';

@Injectable()
export class HouseworkService {
  constructor(
    @InjectRepository(Housework)
    private readonly houseworkRepository: Repository<Housework>,
  ) {}

  async createHousework(
    houseId: number,
    createHouseChoreDto: CreateHouseworkDto,
  ) {
    const houseChore = this.houseworkRepository.create({
      houseId: houseId,
      title: createHouseChoreDto.title,
    });

    return this.houseworkRepository.save(houseChore);
  }

  async getAllHouseworks(houseId: number) {
    return this.houseworkRepository.find({
      where: {
        houseId,
      },
    });
  }

  async softDeleteHousework(
    houseId: number,
    deleteHouseWorkDto: DeleteHouseWorkDto,
  ) {
    try {
      const housework = await this.houseworkRepository.findOneOrFail({
        where: {
          id: deleteHouseWorkDto.houseworkId,
          houseId: houseId,
        },
      });

      await this.houseworkRepository.softDelete(housework.id);
    } catch (e) {
      throw `${e.name}: ${e.message}`;
    }
  }

  async updateHousework(
    houseId: number,
    updateHouseworkDto: UpdateHouseworkDto,
  ) {
    this.houseworkRepository.update(
      {
        id: updateHouseworkDto.houseworkId,
        houseId,
      },
      {
        title: updateHouseworkDto.title,
        frequency: updateHouseworkDto.frequency,
      },
    );
  }

  async getHouseworkById(houseId: number, houseworkId: number) {
    return this.houseworkRepository.findOneOrFail({
      where: {
        id: houseworkId,
        houseId,
      },
    });
  }
}
