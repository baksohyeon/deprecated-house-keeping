import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserInfoDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
