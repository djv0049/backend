// Task Template (Library)
export interface TaskTemplate {
  _id: string;
  type: string; // Unique key (e.g., "Brush Teeth")
  name: string;
  duration: number;
  recurrence: 'daily' | 'weekly' | 'one-off' | 'monthly';
  projectType?: string;
  slotType?: string;
  contextType?: string;
  slotPriority: number;
  contextPriority: number;
  projectPriority: number;
}

// Day Template (Config)
export interface DayTemplate {
  _id: string;
  type: string; // Unique key (e.g., "Monday")
  name: string;
  activeDays: number[];
  slots: Array<{ name: string; start: string; end: string; type: string }>;
  contexts: Array<{ name: string; start: string; end: string; type: string }>;
}

// Daily Schedule (The Day)
export interface DailySchedule {
  _id: string;
  user_id: string;
  date: Date;
  dayTemplateId: string;
  status: 'generated' | 'manual' | 'archived';
}

// Task Instance (The Agenda)
export interface DailyTaskInstance {
  _id: string;
  schedule_id: string;
  taskTemplateId: string;
  type: string;
  title: string;
  slotType?: string;
  contextType?: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  remainingTime: number; // Seconds
  completedAt?: Date;
}

export interface TimetableSlot {
  type: string;
  name: string;
  icon: string;
  startTime: string;
  endTime: string;
}

// 2. Context (Dynamic/Overrideable)
export interface Context {
  type: string;
  name: string;
  icon: string;
  startTime: string;
  endTime: string;
  flexiStart: boolean;
  flexiEnd: boolean;
}
