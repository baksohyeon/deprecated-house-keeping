export class CreateTaskDto {
  id: number;

  creatorUserId?: string;

  assigneeUserId?: string;

  assignerUserId?: string;

  isCompleted: boolean;
}
