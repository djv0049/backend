import { Model } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { MiniContextTemplate } from './MiniContextTemplate';
import { IMiniContext } from '../interfaces';
import { Moment } from 'moment';

@Model()
export class MiniContext extends MiniContextTemplate implements IMiniContext{
  @Property(Date)
  startTime!: Moment;

  @Property(Date)
  endTime!: Moment;
}
