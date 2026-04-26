import { Model } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { IContext, IMiniContext, IProject, ITaskTemplate } from '../interfaces';

export type FrequencyInterval = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export class Frequency {
  @Property()
  count!: number;

  @Property()
  interval!: FrequencyInterval;
}

@Model()
export class TaskTemplate implements ITaskTemplate {
  //@ObjectID()
  //_id!: string;

  @Property()
  name!: string;

  @Property()
  duration!: number;

  @Property()
  isFlexible!: boolean;

  @Property()
  repeating!: boolean;

  @Property()
  frequency!: Frequency;

  @Property()
  miniContexts?: IMiniContext[];

  @Property()
  projects?: IProject[];

  @Property()
  contexts?: IContext[];
}
