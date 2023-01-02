import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { oauthResponseDto } from './dto/oauth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  generateJwtByUserInfo(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  async signIn(requestUser: oauthResponseDto): Promise<string> {
    if (!requestUser) {
      throw new BadRequestException('Unauthenticated');
    }
    const userByEmail = await this.findUserByEmail(requestUser.email);
    if (!userByEmail) {
      return this.registerUser(requestUser.username, requestUser.email);
    }
    return this.generateJwtByUserInfo(userByEmail);
  }

  async registerUser(username: string, email: string): Promise<string> {
    try {
      const userInfo = {
        username: username,
        email: email,
      };
      const assignUser = this.userRepository.create(userInfo);
      const newUser = await this.userRepository.save(assignUser);

      return this.generateJwtByUserInfo(newUser);
    } catch (e) {
      throw new HttpException(
        'register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logOut() {
    return {
      token: '',
    };
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    return user;
  }
}
