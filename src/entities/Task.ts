import { Model } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { Frequency, TaskTemplate } from './TaskTemplate';
import { Moment } from 'moment';
import { IContext, IMiniContext } from '../interfaces';

@Model()
export class Task extends TaskTemplate {
  @Property(Date)
  startTime!: Moment;

  @Property(Date)
  endTime!: Moment;

  @Property(Date)
  completedAt!: Moment;

  @Property()
  started!: boolean;

  @Property(Date)
  timeStarted!: Moment;

  @Property()
  name!: string

  @Property()
  duration!: number // seconds
  
  @Property()
  isFlexible!: boolean

  @Property()
  repeating!: boolean

  @Property()
  frequency!: Frequency

  @Property()
  miniContexts?: IMiniContext[] // ids of the contexts involved

  @Property()
  projects?: []

  @Property()
  contexts?: IContext[]

  @Property()
  score?: number

  @Property()
  number!: number // to be replaced by a rank from within the context array, but for now, it's overall order
}
