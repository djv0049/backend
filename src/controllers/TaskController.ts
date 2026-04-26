// src/controllers/TaskController.ts
import { BodyParams, Controller, Get, Inject, Patch, PathParams, Put } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { Task, TaskTemplate } from '../entities/';

@Controller('/daily-tasks')
export class TaskController {
  @Inject(Task)
  private taskInstance!: MongooseModel<Task>;
  @Inject(TaskTemplate)
  private taskTemplate!: MongooseModel<TaskTemplate>

  @Patch('/:id')
  async updateTaskStatus(@PathParams('id') id: string, @BodyParams() body: any) {
    try {
      const task = await this.taskInstance.findByIdAndUpdate(
        id,
        {
          status: body.status,
          completedAt: body.completedAt,
          timeStarted: body.timeStarted
        },
        { new: true }
      );
      return task;
    } catch (err) {
      console.error(err);
      return { error: 'Update failed' };
    }
  }

  @Put('/')
  async createTask(@BodyParams() body: any) {
    try {
      const { name, duration, isFlexible, repeating, frequency, miniContexts, projects, contexts } = body
      const task = await this.taskTemplate.create(
        {
          name: name,
          duration: duration || 300,
          isFlexible: isFlexible || false,
          repeating: repeating,
          frequency: repeating ? frequency : null,
          miniContexts: miniContexts,
          projects: projects,
          conexts: contexts
        } as TaskTemplate,
      );
      return task;
    } catch (err) {
      console.error(err);
      return { error: 'Create task failed' };
    }
  }

  @Get('/')
  async getTasks() {
    try {
      return this.taskInstance.find({})
    } catch (err) {
      console.error(err);
      return { error: 'fetch task failed' };
    }
  }
}
