console.log('📁 ScheduleController FILE loaded');  // add this as line 1

import { Controller, Get } from '@tsed/common';

@Controller('/schedule')

export class ScheduleController {
  constructor() {
    console.log('✅ ScheduleController registered');
  }
@Get('/')
  async getSchedule() {
    return { ok: true }; // stub it out to rule out import errors
  }
  /*
  @Get('/schedule')
  async getSchedule(@QueryParams('date') date: string) {
    try {
      if (!date) {
        return { error: 'Date required' };
      }

      const currentDate = moment(date);
      const dayOfWeek = currentDate.day();

      const dayTemplate = await DayTemplate.findOne({ activeDays: dayOfWeek });
      if (!dayTemplate) {
        return { tasks: [], dayTemplate: null };
      }

      const existingTasks = await DailyTaskInstance.find({ date: currentDate.toDate() }).lean();
      const pendingTasks = existingTasks.filter((t: any) => t.status === 'pending');
      const activeTasks = existingTasks.filter((t: any) => t.status === 'in-progress');
      const completedTasks = existingTasks.filter((t: any) => t.status === 'completed');

      const needsGeneration = pendingTasks.length === 0 && existingTasks.length === 0;
      let finalPendingTasks = pendingTasks;

      if (needsGeneration) {
        const templates = await TaskTemplate.find({ recurrence: { $in: ['daily', 'weekly'] } });
        finalPendingTasks = await generateScheduleLogic({
          windows: dayTemplate.slots.map(s => ({ ...s, type: 'slot' })),
          templates,
          date: currentDate.toDate()
        });
        await DailyTaskInstance.insertMany(finalPendingTasks);
      } else {
        finalPendingTasks = await generateScheduleLogic({
          windows: dayTemplate.slots.map(s => ({ ...s, type: 'slot' })),
          templates: pendingTasks,
          date: currentDate.toDate()
        });
        finalPendingTasks.forEach((t: any) => {
          DailyTaskInstance.updateOne({ _id: t._id }, { startTime: t.startTime, endTime: t.endTime });
        });
      }

      return { tasks: [...completedTasks, ...activeTasks, ...finalPendingTasks] };
    } catch (err) {
      console.error(err);
      return { error: 'Server Error' };
    }
  }

  @Patch('/daily-tasks/:id')
  async updateTaskStatus(@PathParams('id') id: string, @BodyParams() body: any) {
    try {
      const task = await DailyTaskInstance.findByIdAndUpdate(
        id,
        { 
          status: body.status, 
          remainingTime: body.remainingTime,
          startedAt: body.status === 'in-progress' ? new Date() : undefined,
          completedAt: body.status === 'completed' ? new Date() : undefined
        },
        { new: true }
      );
      return task;
    } catch (err) {
      return { error: 'Update failed' };
    }
  }*/
}
