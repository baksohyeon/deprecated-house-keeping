import { Status } from 'src/entities/enum/status.enum';

export class UpdateInvitationDto {
  invitationId: number;
  status: Status;
}
