
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

const DailyTaskInstanceSchema = new Schema<IDailyTaskInstance>({
  schedule_id: { type: Schema.Types.ObjectId, ref: 'DailySchedule', required: true, index: true },
  taskTemplateId: { type: Schema.Types.ObjectId, ref: 'TaskTemplate', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  
  slotType: String,
  contextType: String,
  
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  remainingTime: { type: Number, default: 0 },
  completedAt: Date,
  startedAt: Date,
}, { timestamps: true });

export default mongoose.model<IDailyTaskInstance>('DailyTaskInstance', DailyTaskInstanceSchema);
