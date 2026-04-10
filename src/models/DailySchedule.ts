
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailySchedule extends Document {
  user_id: string;
  date: Date;
  dayTemplateId: Types.ObjectId; // Reference to DayTemplate
  status: 'generated' | 'manual' | 'archived';
  generatedAt: Date;
}

const DailyScheduleSchema = new Schema<IDailySchedule>({
  user_id: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  dayTemplateId: { type: Schema.Types.ObjectId, ref: 'DayTemplate', required: true },
  status: { 
    type: String, 
    enum: ['generated', 'manual', 'archived'], 
    default: 'generated' 
  },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique schedule per user per day
DailyScheduleSchema.index({ user_id: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailySchedule>('DailySchedule', DailyScheduleSchema);
