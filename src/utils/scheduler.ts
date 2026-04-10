// src/utils/scheduler.ts
import { TimetableSlot, Context } from '../interfaces';

// Helper: Convert "HH:mm" to minutes
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
  templates: any[]; // TaskTemplates or existing instances
  date: Date;
}) {
  // 1. Sort Tasks by Weight
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
      
      // Check if window is after current time AND has enough room
      const hasRoom = (wEnd - wStart) >= task.duration;
      
      // Simple Matching Logic (adapt to your specific needs)
      const matchesContext = !task.contextType || w.type === task.contextType;
      const matchesSlot = !task.slotType || w.type === task.slotType;

      return matchesContext && matchesSlot && hasRoom;
    });

    if (fitWindow) {
      // Assign task
      scheduled.push({
        ...task,
        startTime: fitWindow.startTime,
        endTime: fitWindow.endTime,
        date: date,
        status: 'pending' as const,
        remainingTime: 0 // Initialize to 0
      });
      
      // Update internal clock for next task (simplified logic)
      currentTime += task.duration;
    }
  }

  return scheduled;
}
