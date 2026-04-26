import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { ContextTemplate } from './ContextTemplate';
import { Moment } from 'moment';

@Model()
export class Context extends ContextTemplate implements ContextTemplate {
  @ObjectID()
  _id!: string;

  @Property(Date)
  startTime!: Moment;

  @Property(Date)
  endTime!: Moment;
}
