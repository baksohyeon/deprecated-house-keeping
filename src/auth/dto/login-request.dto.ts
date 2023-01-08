import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
