import { Transform, TransformFnParams } from 'class-transformer';
import { IsNumber, IsNumberString } from 'class-validator';
import { IsValidMember } from '../constraint/is-user-valid-house-member.constraint';

export class HouseParams {
  @IsValidMember()
  @Transform(({ value }) => parseInt(value))
  houseId: number;
}
