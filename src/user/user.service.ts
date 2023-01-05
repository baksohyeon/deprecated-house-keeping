import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    // TODO: error handling
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    return user;
  }

  async createUser(userInfoDto: UserInfoDto) {
    const userObject = this.userRepository.create(userInfoDto);
    return this.userRepository.save(userObject);
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }
    return user;
  }
}
