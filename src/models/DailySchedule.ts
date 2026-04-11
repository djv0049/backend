import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';

@Model()
export class DailySchedule {
  @ObjectID()
  _id!: string;

  @Property()
  user_id!: string;

  @Property()
  date!: Date;

  @Property()
  dayTemplateId!: string;

  @Property()
  status!: 'generated' | 'manual' | 'archived';

  @Property()
  generatedAt!: Date;
}
