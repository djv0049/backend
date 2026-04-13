import { BodyParams, Controller, Get, Inject, Patch, PathParams, QueryParams } from '@tsed/common';
import moment from 'moment';
import { MongooseModel } from '@tsed/mongoose';
import { DayTemplate } from '../models/DayTemplate';
import { DailyTaskInstance } from '../models/DailyTaskInstance';
import { TaskTemplate } from '../models/TaskTemplate';
import { generateScheduleLogic } from '../utils/scheduler';
import { TimetableSlot, Context } from '../interfaces.old';

@Controller('/schedule')
export class ScheduleController {
  @Inject(DailyTaskInstance)
  private dailyTaskInstance!: MongooseModel<DailyTaskInstance>;
  
  @Inject(DayTemplate)
  private dayTemplate!: MongooseModel<DayTemplate>;
  
  @Inject(TaskTemplate)
  private taskTemplate!: MongooseModel<TaskTemplate>;

  @Get('/')
  async getSchedule(@QueryParams('date') date: string) {
    try {
      if (!date) {
        return { error: 'Date required' };
      }

      const currentDate = moment(date, 'YYYY-MM-DD');
      const dayOfWeek = currentDate.day();

      const existingTasks = await this.dailyTaskInstance.find({ date: currentDate.toDate() }).lean();
      const dayTemplateFound = await this.dayTemplate.findOne({ activeDays: dayOfWeek });
      const templates = await this.taskTemplate.find({ recurrence: { $in: ['daily', 'weekly'] } });
      console.log(existingTasks);

      const pendingTasks = existingTasks.filter((t: any) => t.status === 'pending');
      const activeTasks = existingTasks.filter((t: any) => t.status === 'in-progress');
      const completedTasks = existingTasks.filter((t: any) => t.status === 'completed');

      const needsGeneration = pendingTasks.length === 0 && existingTasks.length === 0;
      let finalPendingTasks = pendingTasks;

      if (needsGeneration) {
        const templates = await this.taskTemplate.find({ recurrence: { $in: ['daily', 'weekly'] } });
        const dayTemplateFound = await this.dayTemplate.findOne({ activeDays: dayOfWeek });

        console.log(dayTemplateFound);
        if (!dayTemplateFound) {
          return { tasks: [], dayTemplate: null };
        }

        const windows: (TimetableSlot | Context)[] = dayTemplateFound.slots.map((s: any) => ({
          type: 'slot',
          name: s.name,
          icon: '',
          startTime: s.start,
          endTime: s.end,
          flexiStart: false,
          flexiEnd: false
        }));

        finalPendingTasks = await generateScheduleLogic({
          windows,
          templates,
          date: currentDate.toDate()
        });
        await this.dailyTaskInstance.insertMany(finalPendingTasks);
      } else {
        const dayTemplateFound = await this.dayTemplate.findOne({ activeDays: dayOfWeek });
        if (!dayTemplateFound) {
          return { tasks: [], dayTemplate: null };
        }

        const windows: (TimetableSlot | Context)[] = dayTemplateFound.slots.map((s: any) => ({
          type: 'slot',
          name: s.name,
          icon: '',
          startTime: s.start,
          endTime: s.end,
          flexiStart: false,
          flexiEnd: false
        }));

        finalPendingTasks = await generateScheduleLogic({
          windows,
          templates: pendingTasks,
          date: currentDate.toDate()
        });
        finalPendingTasks.forEach((t: any) => {
          this.dailyTaskInstance.updateOne({ _id: t._id }, { startTime: t.startTime, endTime: t.endTime });
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
      const task = await this.dailyTaskInstance.findByIdAndUpdate(
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
