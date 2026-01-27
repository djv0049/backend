import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Task {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  startTime!: Date;

  @Property()
  endTime!: Date;

  @Property()
  priority!: number;

  @Property()
  createdAt: Date = new Date()

}
