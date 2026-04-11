import { Controller, Post, Get, BodyParams } from '@tsed/common';
import { Inject, Injectable } from '@tsed/di';
import { TaskTemplate as TaskTemplateModel } from '../models/TaskTemplate';
import type { TaskTemplate } from '../interfaces';
import { MongooseModel } from '@tsed/mongoose';

@Controller('/templates')
@Injectable()
export class TemplateController {
  @Inject(TaskTemplateModel)
  private taskTemplateModel!: MongooseModel<TaskTemplate>;

  @Get('/')
  async getTemplates() {
    console.log('getting templates');
    return this.taskTemplateModel.find({});
  }

  @Post('/')
  async createTemplate(@BodyParams() template: Partial<TaskTemplate>) {
    try {
      const newTemplate = new TaskTemplateModel();

      await this.taskTemplateModel.create({...template})
      return newTemplate;
    } catch (err) {
      return { error: 'Creation failed' };
    }
  }
}
