import { Transform, TransformFnParams } from 'class-transformer';
import { IsNumber, IsNumberString } from 'class-validator';
import { IsValidMember } from './is-user-valid-house-member.validator';

export class HouseParams {
  @IsValidMember()
  houseId: number;
}
