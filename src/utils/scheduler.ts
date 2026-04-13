// src/utils/scheduler.ts
import { TimetableSlot, Context } from '../interfaces.old';
import type { TaskTemplate } from '../models/TaskTemplate';

// Helper: Convert "HH:mm" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h * 60) + m;
};

// Helper: Calculate Weight (Same logic as frontend)
const calculateWeight = (task: any): number => {
  let totalWeight = 0;
  let sections = 0;
  if (task.slotType) { totalWeight += 1 * task.slotPriority; sections++; }
  if (task.projectType) { totalWeight += 1.1 * task.projectPriority; sections++; }
  if (task.contextType) { totalWeight += 1.2 * task.contextPriority; sections++; }
  return sections > 0 ? totalWeight / sections : 0;
};

export async function generateScheduleLogic({
  windows,
  templates,
  date
}: {
  windows: (TimetableSlot | Context)[];
  templates: TaskTemplate[] | any[];
  date: Date;
}) {
  // 1. Sort Tasks by Weight (Highest Priority First)
  const sortedTasks = [...templates].sort((a, b) => calculateWeight(b) - calculateWeight(a));
  
  // 2. Sort Windows by Start Time
  const sortedWindows = [...windows].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const scheduled = [];
  let currentTime = 0; // Track minutes into the day

  // 3. Greedy Algorithm
  for (const task of sortedTasks) {
    // Find the best matching window
    const fitWindow = sortedWindows.find((w) => {
      const wStart = timeToMinutes(w.startTime);
      const wEnd = timeToMinutes(w.endTime);
      
      // Check if window has enough room
      const hasRoom = (wEnd - wStart) >= task.duration;
      
      // Matching Logic
      const matchesContext = !task.contextType || w.type === task.contextType;
      const matchesSlot = !task.slotType || w.type === task.slotType;

      // FIXME: logic for showing only contexts, and matching more having higer priority {return a number along with the object, for weighted matches}
      return hasRoom && matchesContext && matchesSlot;
    });

    if (fitWindow) {
      // Assign task to the start of the window
      scheduled.push({
        ...task,
        startTime: fitWindow.startTime,
        endTime: fitWindow.endTime,
        date: date,
        status: 'pending' as const,
        remainingTime: 0 // Initialize to 0, will be calculated by duration * 60 if needed
      });
    }
  }

  return scheduled;
}
