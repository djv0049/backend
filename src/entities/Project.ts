import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { ContextTemplate } from './ContextTemplate';
import { TaskTemplate } from './TaskTemplate';

@Model()
export class Project {
  @ObjectID()
  _id!: string;

  @Property()
  name!: string;

  @Property()
  color!: string;

  @Property()
  isActive!: boolean;

  @Property()
  tasks!: TaskTemplate[];

  @Property()
  contexts!: ContextTemplate[];
}
