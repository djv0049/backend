import { Controller, Post, Get, BodyParams } from '@tsed/common';
import { Injectable } from '@tsed/di';
import TaskTemplateModel from '../models/TaskTemplate';
import type { TaskTemplate } from '../interfaces';

@Controller('/api')
@Injectable()
export class TemplateController {
  @Get('/templates')
  async getTemplates() {
    return TaskTemplateModel.find();
  }

  @Post('/templates')
  async createTemplate(@BodyParams() template: Partial<TaskTemplate>) {
    try {
      const newTemplate = new TaskTemplateModel(template);
      await newTemplate.save();
      return newTemplate;
    } catch (err) {
      return { error: 'Creation failed' };
    }
  }
}
