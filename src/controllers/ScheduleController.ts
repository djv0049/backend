import { BodyParams, Controller, Get, Inject, Patch, PathParams, QueryParams } from '@tsed/common';
import moment from 'moment';
import { MongooseModel } from '@tsed/mongoose'
import { DayTemplate } from '../models';
import DailyTaskInstance from '../models/DailyTaskInstance';
import TaskTemplate from '../models/TaskTemplate';
import { generateScheduleLogic } from '../utils/scheduler';

@Controller('/schedule')
export class ScheduleController {
  @Inject(DayTemplate)
  private dayTemplate!: MongooseModel<DayTemplate>

  @Get('/')
  async getSchedule(@QueryParams('date') date: string) {
    try {
      if (!date) {
        return { error: 'Date required' };
      }

      const currentDate = moment(date, "YYYY-MM-DD");
      console.log(currentDate)
      const dayOfWeek = currentDate.day();

      console.log(process.env.MONGO_URL)
      const dayTemplateFound = await this.dayTemplate.findOne({ activeDays: dayOfWeek });
      console.log(dayTemplateFound)
      if (!dayTemplateFound) {
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
          windows: dayTemplateFound.slots.map((s: DayTemplate) => ({ ...s, type: 'slot' } as DayTemplate)),
          templates,
          date: currentDate.toDate()
        });
        await DailyTaskInstance.insertMany(finalPendingTasks);
      } else {
        finalPendingTasks = await generateScheduleLogic({
          windows: dayTemplateFound.slots.map((s: DayTemplate) => ({ ...s, type: 'slot' })),
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
  }
}
