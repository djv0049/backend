import { BodyParams, Controller, Inject, Patch, PathParams } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { DailyTaskInstance } from '../models/DailyTaskInstance';

@Controller('/tasks')
export class TaskController {
  @Inject(DailyTaskInstance)
  private dailyTaskInstance!: MongooseModel<DailyTaskInstance>;

  @Patch('/:id')
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
