import { Model } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { MiniContextTemplate } from './MiniContextTemplate';
import { IMiniContext } from '../interfaces';

@Model()
export class MiniContext extends MiniContextTemplate implements IMiniContext{
  @Property()
  startTime!: string;

  @Property()
  endTime!: string;
}
