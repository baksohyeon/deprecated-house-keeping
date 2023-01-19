import { IsEmail, IsNotEmpty, IsString, IsDate } from 'class-validator';

export class ResponseLoginUserDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  UpdatedAt: Date;
}
