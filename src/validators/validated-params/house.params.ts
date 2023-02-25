import { Transform, TransformFnParams } from 'class-transformer';
import { IsNumber, IsNumberString } from 'class-validator';
import { IsValidMember } from '../decorator/is-valid-member.decorator';

export class HouseParams {
  @IsValidMember()
  @Transform(({ value }) => parseInt(value))
  houseId: number;
}
