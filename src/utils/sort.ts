import type { TaskTemplate, TimetableSlot, Context,  } from '../interfaces.ts';

// Helper: Convert "HH:mm" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper: Convert minutes to "HH:mm"
const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// 1. Calculate Weighted Score (Same as before)
const calculateWeight = (task: TaskTemplate): number => {
  let totalWeight = 0;
  let sections = 0;

  if (task.slotType) {
    totalWeight += 1 * task.slotPriority;
    sections++;
  }
  if (task.slotType) {
    totalWeight += 1.1 * task.projectPriority;
    sections++;
  }
  if (task.slotType) {
    totalWeight += 1.2 * task.contextPriority;
    sections++;
  }

  return sections > 0 ? totalWeight / sections : 0;
};

// 2. Main Sorting & Scheduling Logic (Time-Sweep Algorithm)
export interface ScheduleResult {
  prospectList: TaskTemplate[]; // Unscheduled tasks with intended times
  plannedList: TaskTemplate[];  // Successfully scheduled tasks
}

export function generateSchedule(
  slots: (TimetableSlot | Context)[],
  tasks: TaskTemplate[],
  projects: any[],
  currentTime: number = 1
): ScheduleResult {
  const MAX_TIME = 24 * 60; // End of day
  if (!currentTime) currentTime = timeToMinutes(`${new Date().getHours()}:${new Date().getMinutes()}`)

  const plannedList: TaskTemplate[] = [];
  const scheduledIds = new Set<string>();
  const activeProjects = new Set(projects.filter(p => p.status === 'active').map(p => p.type));

  // Helper: Check if container is active at current time
  const isActive = (container: TimetableSlot | Context) => {
    const start = timeToMinutes(container.startTime);
    const end = timeToMinutes(container.endTime);
    return currentTime >= start && currentTime < end;
  };

  // Helper: Get remaining time for a container
  const getRemainingTime = (container: TimetableSlot | Context) => {
    const end = timeToMinutes(container.endTime);
    return end - currentTime;
  };

  // Helper: Find next jump time
  const getNextJumpTime = (
    activeContainers: (TimetableSlot | Context)[],
    allContainers: (TimetableSlot | Context)[]
  ): number => {
    let minEnd = 0
    let nextStart = 0
    if (activeContainers.length > 0) {
      minEnd = Math.min(
        ...activeContainers.map(c => timeToMinutes(c.endTime))
      );
    }

    const nextStartTime = allContainers
      .filter(c => timeToMinutes(c.startTime) > currentTime)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0];

    if (nextStartTime) {
      nextStart = timeToMinutes(nextStartTime.startTime);
    }
    if (nextStart && minEnd) {
      if (minEnd > nextStart) return nextStart
      if (minEnd < nextStart) return minEnd
      if (minEnd == nextStart) return minEnd
    }
    if (nextStart) return nextStart
    if (minEnd) return minEnd

    // 3. If no more containers, end loop
    return MAX_TIME + 1;
  };

  // Helper: Find highest priority task matching current state
  const findBestTask = (activeContainers: (TimetableSlot | Context)[]): TaskTemplate | null => {
    const candidates = tasks.filter(t => !scheduledIds.has(t._id) );

    const activeSlots = activeContainers.filter((c): c is TimetableSlot => 'days' in c);
    const activeContexts = activeContainers.filter((c): c is Context => 'flexiStart' in c);

    const hasSlots = activeSlots.length > 0;
    const hasContexts = activeContexts.length > 0;

    const validTasks = candidates.filter(task => {
      const slotMatch = task.slotType
        ? activeSlots.some(s => s.type === task.slotType)
        : false;

      const contextMatch = task.contextType
        ? activeContexts.some(c => c.type === task.contextType)
        : false;

      if (hasSlots && hasContexts) {
        // Task must match at least one active slot AND one active context
        return slotMatch && contextMatch;
      }

      if (hasContexts && !hasSlots) {
        // Only contexts active — task needs a matching context, no slot
        return contextMatch
      }

      if (hasSlots && !hasContexts) {
        // Only slots active — task needs a matching slot, no context
        return slotMatch && !task.contextType;
      }

      // Nothing active — only tasks with no slot and no context qualify
      return !task.slotType && !task.contextType;
    });

    if (validTasks.length === 0) return null;

    // TODO: SORT BY AMOUNT OF MATCHES. CONTEXT and SLOT should outweigh just context
    validTasks.sort((a, b) => calculateWeight(b) - calculateWeight(a));
    return validTasks[0];
  };

  // Main Loop
  while (currentTime < MAX_TIME) {
    // A. Identify Active Containers
    const activeContainers = slots.filter(isActive);

    // B. Calculate Remaining Time for ALL active containers
    // (The task must fit in the MOST RESTRICTIVE one)
    let minRemainingTime = Infinity;
    if (activeContainers.length > 0) {
      minRemainingTime = Math.min(
        ...activeContainers.map(getRemainingTime)
      );
    }

    // C. Find Best Task
    const bestTask = findBestTask(activeContainers);

    // D. Decide Action
    if (bestTask) {
      // Check if it fits within the tightest container constraint
      const remainingTime = bestTask.duration
      const fitsDuration = remainingTime <= minRemainingTime;

      if (fitsDuration) {
        // 1. Schedule
        const start = minutesToTime(currentTime);
        const end = minutesToTime(currentTime + bestTask.duration);

        plannedList.push({
          ...bestTask,
        });

        scheduledIds.add(bestTask._id);
        currentTime += bestTask.duration;
      } else {
        // 2. Task doesn't fit (too long for current window)
        // Jump to the end of the current window
        currentTime = getNextJumpTime(activeContainers, slots);
      }
    } else {
      // 3. No tasks match criteria
      // Jump to next container start or end of active
      currentTime = getNextJumpTime(activeContainers, slots);
    }
  }

  // E. Prepare Prospect List (Display Unscheduled Tasks)
  const displayProspectList = tasks
    .filter(t => !scheduledIds.has(t._id))
    .map((task) => {
      let intendedStart = "TBD";
      let intendedEnd = "TBD";
      let intendedName = "Unknown";

      // Find which container this task was supposed to go to
      const container = slots.find(c =>
        (task.contextType && c.type === task.contextType) ||
        (task.slotType && c.type === task.slotType)
      );

      if (container) {
        intendedName = container.name;
        intendedStart = container.startTime;
        intendedEnd = container.endTime;
      }

      return { ...task, intendedStart, intendedEnd, intendedName };
    });


  return {
    prospectList: displayProspectList,
    plannedList
  };
}
