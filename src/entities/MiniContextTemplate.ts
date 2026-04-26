import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { ContextTemplate } from './ContextTemplate';

@Model()
export class MiniContextTemplate extends ContextTemplate implements MiniContextTemplate {
  @ObjectID()
  _id!: string;

  @Property()
  flexiStart!: boolean;

  @Property()
  flexiEnd!: boolean;
}
