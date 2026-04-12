// src/controllers/TaskController.ts
import { BodyParams, Controller, Inject, Patch, PathParams } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { DailyTaskInstance } from '../models/DailyTaskInstance';
// Import ScheduleService or Scheduler if you want backend logic here
// import { generateScheduleLogic } from '../utils/scheduler'; 

@Controller('/daily-tasks') // 👈 Changed from '/tasks'
export class TaskController {
  @Inject(DailyTaskInstance)
  private dailyTaskInstance!: MongooseModel<DailyTaskInstance>;

  @Patch('/:id')
  async updateTaskStatus(@PathParams('id') id: string, @BodyParams() body: any) {
    try {
      // 1. Update Task
      const task = await this.dailyTaskInstance.findByIdAndUpdate(
        id,
        {
          status: body.status,
          remainingTime: body.remainingTime,
          completedAt: body.status === 'completed' ? new Date() : undefined,
          startedAt: body.status === 'in-progress' ? new Date() : undefined
        },
        { new: true }
      );

      // 2. (Optional) Trigger Reschedule if completed
      // If you want the backend to auto-reschedule remaining tasks:
      if (body.status === 'completed') {
         // You would need to access DayTemplate and run scheduler logic here
         // For MVP, we can just return the updated task and let Frontend refetch schedule
      }

      return task;
    } catch (err) {
      console.error(err);
      return { error: 'Update failed' };
    }
  }
}
