// src/controllers/TemplateController.ts
import { Controller, Post, Get, BodyParams, Delete, PathParams, QueryParams, Put } from '@tsed/common';
import { Inject, Injectable } from '@tsed/di';
import { TaskTemplate, TaskTemplate as TaskTemplateModel } from '../models/TaskTemplate';
import { DayTemplate as DayTemplateModel } from '../models/DayTemplate';
import { MongooseModel } from '@tsed/mongoose';
import { DayTemplate } from '../interfaces.old';

@Controller('/templates')
@Injectable()
export class TemplateController {
  @Inject(TaskTemplateModel)
  private taskTemplateModel!: MongooseModel<TaskTemplate>;

  @Inject(DayTemplateModel)
  private dayTemplateModel!: MongooseModel<DayTemplate>;

  // 1. GET All Task Templates (Tasks)
  @Get('/')
  async getTaskTemplates() {
    return this.taskTemplateModel.find({});
  }

  // 2. POST Task Template (Task)
  @Post('/')
  async createTaskTemplate(@BodyParams() template: Partial<TaskTemplate>) {
    return this.taskTemplateModel.create({...template});
  }

  // 3. DELETE Task Template
  @Delete('/:id')
  async deleteTaskTemplate(@PathParams('id') id: string) {
    return this.taskTemplateModel.findByIdAndDelete(id);
  }

  // 4. NEW: GET Day Templates (Slots/Contexts/Projects)
  @Get('/day-templates')
  async getDayTemplates() {
    return this.dayTemplateModel.find({});
  }

  // 5. NEW: POST Day Template (Save Slots/Contexts)
  @Post('/day-templates')
  async createDayTemplate(@BodyParams() dayTemplate: Partial<DayTemplate>) {
    return this.dayTemplateModel.create({...dayTemplate});
  }
  
  // 6. NEW: UPDATE Day Template
  @Put('/day-templates/:id')
  async updateDayTemplate(@PathParams('id') id: string, @BodyParams() dayTemplate: Partial<DayTemplate>) {
    return this.dayTemplateModel.findByIdAndUpdate(id, {...dayTemplate}, { new: true });
  }
}
