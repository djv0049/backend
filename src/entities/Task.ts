import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { Property, Required } from "@tsed/schema";

@Model()
export class Task {
  @ObjectID("id")
  _id!: string;

  @Required()
  name!: string;

  @Required()
  priority!: number;

  @Property()
  startTime?: Date;

  @Property()
  endTime?: Date;

  @Property()
  createdAt!: Date;

  @Property()
  lastCompleted?: Date;

  @Required()
  isStreak!: boolean;

  @Property()
  streakCount?: number;
}
