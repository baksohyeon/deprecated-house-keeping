import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestLoginUserDto } from 'src/module/auth/dto/request-login-user.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    return user;
  }

  async createUser(userInfo: RequestLoginUserDto): Promise<User> {
    const userObject = this.userRepository.create(userInfo);
    return this.userRepository.save(userObject);
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }
    return user;
  }

  async getUserWithRoles(user: User) {
    const profile = await this.userRepository.find({
      select: {
        housemembers: {
          role: true,
          house: {
            name: true,
            id: true,
          },
        },
      },
      where: {
        id: user.id,
        housemembers: {
          userId: user.id,
        },
      },
      relations: {
        // housemembers: true,
        housemembers: {
          house: true,
        },
      },
    });
    const { housemembers, ...userInfo } = profile[0];

    const roles = housemembers.map((memberInfos) => {
      return {
        role: memberInfos.role,
        houseId: memberInfos.house.id,
        houseName: memberInfos.house.name,
      };
    });

    return {
      user: userInfo,
      memberInfo: roles,
    };
  }

  async registerUser(userInfo: RequestLoginUserDto) {
    const user = await this.findUserByEmail(userInfo.email);
    if (!user) {
      return this.createUser(userInfo);
    }
    return user;
  }
}
