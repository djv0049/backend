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
  activeDays!: number[]
  @Property()
  slots!: Array<{
    type: { type: String, required: true, enum: ['slot'] },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
  }>
  @Property()
  contexts!: Array<{
    type: { type: String, required: true, enum: ['context'] },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
  }>
  @Property()
  defaultProjectType!: String
}
