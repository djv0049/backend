import { Controller, Post, Get, BodyParams } from '@tsed/common';
import { Inject, Injectable } from '@tsed/di';
import {  TaskTemplate as TaskTemplateModel } from '../models/TaskTemplate';
import type { TaskTemplate } from '../interfaces';
import { MongooseModel } from '@tsed/mongoose';

@Controller('/templates')
@Injectable()
@Inject(TaskTemplateModel)
export class TemplateController {
  private taskTemplateModel!: MongooseModel<TaskTemplate> 
  @Get('/')
  async getTemplates() {
    console.log("getting templates")
    return this.taskTemplateModel.find({});
  }

  @Post('/')
  async createTemplate(@BodyParams() template: Partial<TaskTemplate>) {
    try {
      const newTemplate = new TaskTemplate(template);
      await newTemplate.save();
      return newTemplate;
    } catch (err) {
      return { error: 'Creation failed' };
    }
  }
}
