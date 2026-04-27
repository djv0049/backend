import { Model } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { MiniContextTemplate } from './MiniContextTemplate';
import { IMiniContext } from '../interfaces';

@Model()
export class MiniContext extends MiniContextTemplate implements IMiniContext{
  @Property(Date)
  startTime!: string;

  @Property(Date)
  endTime!: string;
}
