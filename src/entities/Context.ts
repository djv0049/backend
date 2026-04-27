import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { ContextTemplate } from './ContextTemplate';
import { Moment } from 'moment';
import { IContextTemplate, IMiniContextTemplate } from '../interfaces';

@Model()
export class Context extends ContextTemplate implements IContextTemplate {

  @ObjectID()
  _id!: string;

  @Property()
  startTime!: string;

  @Property()
  endTime!: string;
}
