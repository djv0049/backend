import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';

@Model()
export class DayTemplate {
  @ObjectID()
  _id!: string;

  @Property()
  type!: string;

  @Property()
  name!: string;

  @Property()
  activeDays!: number[];

  @Property()
  slots!: Array<{
    type: string;
    name: string;
    start: string;
    end: string;
  }>;

  @Property()
  contexts!: Array<{
    type: string;
    name: string;
    start: string;
    end: string;
  }>;

  @Property()
  defaultProjectType?: string;
}
