import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { Property, Required } from "@tsed/schema";

@Model()
export class Task {
  @ObjectID()
  _id!: string;

  @Required()
  name!: string;

  @Required()
  priority!: number;

  @Property()
  startTime?: string;

  @Property()
  endTime?: string;

  @Property()
  createdAt!: Date;

  @Property()
  lastCompleted?: Date;

  @Property()
  isStreak!: boolean;

  @Property()
  streakCount?: number;
}
