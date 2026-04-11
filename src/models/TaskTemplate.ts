import { ObjectID } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import { Document } from 'mongoose';

export interface ITaskTemplate extends Document {
  type: string; // Unique identifier (e.g., "Brush Teeth")
  name: string;
  duration: number; // in minutes
  recurrence: 'daily' | 'weekly' | 'one-off' | 'monthly';
  // Optional links to other templates
  projectType?: string;
  slotType?: string;
  contextType?: string;
  // TODO: link to template taskListOrder TBI
  // Priority weights for the scheduler
  slotPriority: number;
  contextPriority: number;
  projectPriority: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskTemplate {
  @ObjectID()
  _id!: string
  @Property()
  type!: {
    type: String,
    required: true,
    unique: true // Ensures "Brush Teeth" doesn't appear twice
  }
  @Property()
  name!: { type: String, required: true }
  @Property()
  duration!: { type: Number, required: true, min: 1 }
  @Property()
  recurrence!: {
    type: String,
    enum: ['daily', 'weekly', 'one-off', 'monthly'],
    default: 'daily'
  }
  @Property()
  projectType!: String
  @Property()
  slotType!: String
  @Property()
  contextType!: String
  @Property()
  slotPriority!: { type: Number, default: 5 }
  @Property()
  contextPriority!: { type: Number, default: 5 }
  @Property()
  projectPriority!: { type: Number, default: 0 }
}
