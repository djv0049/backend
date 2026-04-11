import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';

@Model()
export class DailyTaskInstance {
  @ObjectID()
  _id!: string;

  @Property()
  schedule_id?: string;

  @Property()
  taskTemplateId!: string;

  @Property()
  type!: string;

  @Property()
  title!: string;

  @Property()
  slotType?: string;

  @Property()
  contextType?: string;

  @Property()
  startTime!: string;

  @Property()
  endTime!: string;

  @Property()
  status!: 'pending' | 'in-progress' | 'completed';

  @Property()
  remainingTime!: number;

  @Property()
  completedAt?: Date;

  @Property()
  startedAt?: Date;
}
