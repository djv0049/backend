import { Model, ObjectID } from "@tsed/mongoose";
import { Property, Required } from "@tsed/schema";

@Model()
export class Task {
  @ObjectID()
  _id!: string;

  @Required()
  name!: string;

  @Property()
  startTime?: string;

  @Property()
  endTime?: string;

  @Property()
  createdAt!: Date;

  @Property()
  lastModified?: {date: Date, action: string};

  @Property()
  isStreak!: boolean;

  @Property()
  streakCount?: number;

  @Property()
  timeframes?: []
}
