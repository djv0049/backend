
import { ObjectID, Model } from '@tsed/mongoose';
import { Property } from '@tsed/schema';
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailyTaskInstance extends Document {
  schedule_id: Types.ObjectId; // Reference to DailySchedule
  taskTemplateId: Types.ObjectId; // Reference to TaskTemplate
  type: string; // Semantic type (e.g., "Brush Teeth")
  title: string; // Display title
  
  // Time slots
  slotType?: string; 
  contextType?: string;
  startTime: string; // "08:00"
  endTime: string;   // "08:15"
  
  // Status & Timer
  status: 'pending' | 'in-progress' | 'completed';
  remainingTime: number; // Seconds (for the countdown)
  completedAt?: Date;
  startedAt?: Date;
}

@Model()
export class DailyTaskInstance{
  @ObjectID()
  _id!: string

  @Property()
  schedule_id?: { type: Schema.Types.ObjectId, ref: 'DailySchedule', required: true, index: true }
  @Property()
  taskTemplateId!: { type: Schema.Types.ObjectId, ref: 'TaskTemplate', required: true }
  @Property()
  type!: { type: String, required: true }
  @Property()
  title!: { type: String, required: true }
  
  @Property()
  slotType?: String
  @Property()
  contextType?: String
  
  @Property()
  startTime?: { type: String, required: true }
  @Property()
  endTime?: { type: String, required: true }
  
  @Property()
  status?: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  }
  @Property()
  remainingTime?: { type: Number, default: 0 }
  @Property()
  completedAt?: Date
  @Property()
  startedAt?: Date
} 
