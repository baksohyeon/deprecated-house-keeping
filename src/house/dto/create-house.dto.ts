import { IsString } from 'class-validator';

export class CreateHouseDto {
  @IsString()
  name: string;
}
