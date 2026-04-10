import mongoose, { Schema, Document, Types } from 'mongoose';
import type { TimetableSlot, Context } from '../interfaces';

export interface IDayTemplate extends Document {
  type: string;
  name: string;
  activeDays: number[];
  slots: TimetableSlot[]; // Use the actual interface
  contexts: Context[];     // Use the actual interface
  defaultProjectType?: string;
}

const DayTemplateSchema = new Schema<IDayTemplate>({
  type: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  activeDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6], required: true },
  slots: [{
    type: { type: String, required: true, enum: ['slot'] },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    // Add any other slot properties you need
  }],
  contexts: [{
    type: { type: String, required: true, enum: ['context'] },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    // Add any other context properties you need
  }],
  defaultProjectType: String,
}, { timestamps: true });

export default mongoose.model<IDayTemplate>('DayTemplate', DayTemplateSchema);
