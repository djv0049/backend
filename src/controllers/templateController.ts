import { Controller, Post, Get, BodyParams, Delete, PathParams, QueryParams, Put, Patch } from '@tsed/common';
import { Inject, Injectable } from '@tsed/di';
import { TaskTemplate, TaskTemplate as TaskTemplateModel } from '../entities/TaskTemplate';
import { MongooseModel } from '@tsed/mongoose';
//import { DayTemplate } from '../entities/DayTemplate';
import { ContextTemplate, MiniContextTemplate } from '../entities';

@Controller('/templates')
@Injectable()
export class TemplateController {
  @Inject(TaskTemplateModel)
  private taskTemplateModel!: MongooseModel<TaskTemplate>;

  //@Inject(DayTemplate)
  //private dayTemplateModel!: MongooseModel<DayTemplate>;

  @Inject(ContextTemplate)
  private contextTemplateModel!: MongooseModel<ContextTemplate>;

  @Inject(MiniContextTemplate)
  private miniContextTemplateModel!: MongooseModel<MiniContextTemplate>;

  // Task
  @Get('/')
  async getTaskTemplates() {
    return this.taskTemplateModel.find({});
  }

  @Post('/')
  async createTaskTemplate(@BodyParams() template: Partial<TaskTemplate>) {
    return this.taskTemplateModel.create({ ...template });
  }

  @Delete('/:id')
  async deleteTaskTemplate(@PathParams('id') id: string) {
    return this.taskTemplateModel.findByIdAndDelete(id);
  }

  // Context
  @Get('/context-templates')
  async getContexts() {
    return this.contextTemplateModel.find({})
  }

  @Post('/context-templates')
  async createContexts(@BodyParams() contextTemplate: Partial<ContextTemplate>) {
    return this.contextTemplateModel.create({ ...contextTemplate })
  }

  @Patch('/context-templates/:id')
  async updateContexts(@PathParams('id') id: string, @BodyParams() contextTemplate: Partial<ContextTemplate>) {
    return this.contextTemplateModel.findByIdAndUpdate(id, { ...contextTemplate }, { new: true });
  }

  @Delete('/context-templates/:id')
  async deleteContexts(@PathParams('id') id: string) {
    return this.contextTemplateModel.deleteOne({ _id: id })
  }

  // MiniContext
  @Get('/mini-context-templates')
  async getMiniContexts() {
    return this.miniContextTemplateModel.find({})
  }

  @Post('/mini-context-templates')
  async createMiniContexts(@BodyParams() miniContextTemplate: Partial<MiniContextTemplate>) {
    return this.miniContextTemplateModel.create({ ...miniContextTemplate })
  }

  @Patch('/mini-context-templates/:id')
  async updateMiniContexts(@PathParams('id') id: string, @BodyParams()miniCcontextTemplate: Partial<MiniContextTemplate>) {
    return this.miniContextTemplateModel.findByIdAndUpdate(id, { ...miniCcontextTemplate }, { new: true });
  }

  @Delete('/mini-context-templates/:id')
  async deleteMiniContexts(@PathParams('id') id: string) {
    return this.miniContextTemplateModel.deleteOne({ _id: id })
  }

  // Day
  /*
  @Get('/day-templates')
  async getDayTemplates() {
    return this.dayTemplateModel.find({});
  }

  @Post('/day-templates')
  async createDayTemplate(@BodyParams() dayTemplate: Partial<DayTemplate>) {
    return this.dayTemplateModel.create({ ...dayTemplate });
  }

  @Put('/day-templates/:id') async updateDayTemplate(@PathParams('id') id: string, @BodyParams() dayTemplate: Partial<DayTemplate>) {
    return this.dayTemplateModel.findByIdAndUpdate(id, { ...dayTemplate }, { new: true });
  }
  */

}
