
import { Model, ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { IContext, IMiniContext } from '../interfaces';


@Model()
export class DayTemplate {
  @ObjectID()
  _id!: string

  @Property()
  name!: string;

  @Property()
  contexts!: IContext[];

  @Property()
  miniContexts!: IMiniContext[];
}
