import { Model, ObjectID } from '@tsed/mongoose'
import {Property, Required } from '@tsed/schema'

@Model()
export class DayTemplate {

  @ObjectID()
  _id!: string
  @Property()
  type!: { type: String, required: true, unique: true }
  @Property()
  name!: { type: String, required: true }
  @Property()
  activeDays!: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6], required: true }
  @Property()
  slots!: [{
    type: { type: String, required: true, enum: ['slot'] },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    // Add any other slot properties you need
  }]
  @Property()
  contexts!: [{
    type: { type: String, required: true, enum: ['context'] },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    // Add any other context properties you need
  }]
  @Property()
  defaultProjectType!: String
}
