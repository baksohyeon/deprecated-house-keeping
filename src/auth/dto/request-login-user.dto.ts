import { IsEmail, IsNotEmpty, IsString, IsDate } from 'class-validator';

export class RequestLoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
