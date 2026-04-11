import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';

@Model()
export class TaskTemplate {
  @ObjectID()
  _id!: string;

  @Property()
  type!: string;

  @Property()
  name!: string;

  @Property()
  duration!: number;

  @Property()
  recurrence!: 'daily' | 'weekly' | 'one-off' | 'monthly';

  @Property()
  projectType?: string;

  @Property()
  slotType?: string;

  @Property()
  contextType?: string;

  @Property()
  slotPriority!: number;

  @Property()
  contextPriority!: number;

  @Property()
  projectPriority!: number;

  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;
}
