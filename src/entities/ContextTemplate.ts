import { Property } from '@tsed/schema';
import { TaskTemplate } from './TaskTemplate';

export class TimeframeContainer {
  @Property()
  name!: string;

  @Property()
  color!: string;

  @Property()
  tasks!: TaskTemplate[];
}

export class ContextTemplate extends TimeframeContainer {
  @Property()
  icon!: string;
}
