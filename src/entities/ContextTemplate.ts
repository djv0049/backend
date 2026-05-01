import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { TaskTemplate } from './TaskTemplate';

export class TimeframeContainer {
  @ObjectID()
  _id!: string;

  @Property()
  name!: string;

  @Property()
  color!: string;

  @Property()
  tasks!: TaskTemplate[];

  @Property()
  startTime?: string

  @Property()
  endTime?: string
}

@Model()
export class ContextTemplate extends TimeframeContainer {
  @Property()
  icon!: string;
}
