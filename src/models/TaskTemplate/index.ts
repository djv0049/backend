import mongoose, { Schema, Document, Types } from 'mongoose';

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

const TaskTemplateSchema = new Schema<ITaskTemplate>({
  type: {
    type: String,
    required: true,
    unique: true // Ensures "Brush Teeth" doesn't appear twice
  },
  name: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 },
  recurrence: {
    type: String,
    enum: ['daily', 'weekly', 'one-off', 'monthly'],
    default: 'daily'
  },
  projectType: String,
  slotType: String,
  contextType: String,
  slotPriority: { type: Number, default: 5 },
  contextPriority: { type: Number, default: 5 },
  projectPriority: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<ITaskTemplate>('TaskTemplate', TaskTemplateSchema);
