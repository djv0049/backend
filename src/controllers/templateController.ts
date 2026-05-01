import { Controller, Post, Get, BodyParams, Delete, PathParams, QueryParams, Put, Patch } from '@tsed/common';
import { Inject, Injectable } from '@tsed/di';
import { TaskTemplate, TaskTemplate as TaskTemplateModel } from '../entities/TaskTemplate';
import { MongooseModel } from '@tsed/mongoose';
//import { DayTemplate } from '../entities/DayTemplate';
import { ContextTemplate, MiniContextTemplate } from '../entities';
import { log } from 'node:console';
import { DayTemplate } from '../entities/DayTemplate';

@Controller('/templates')
@Injectable()
export class TemplateController {
  @Inject(TaskTemplateModel)
  private taskTemplateModel!: MongooseModel<TaskTemplate>;

  @Inject(ContextTemplate)
  private contextTemplateModel!: MongooseModel<ContextTemplate>;

  @Inject(MiniContextTemplate)
  private miniContextTemplateModel!: MongooseModel<MiniContextTemplate>;

  @Inject(DayTemplate)
  private dayTemplateModel!: MongooseModel<DayTemplate>;

  // Task
  @Get('/')
  async getAllTemplates() {
    const contexts = await this.contextTemplateModel.find({})
    const miniContexts = await this.miniContextTemplateModel.find({})
    const tasks = await this.taskTemplateModel.find({});
    const days = await this.dayTemplateModel.find({});
    return { contexts, miniContexts, tasks, days }
  }
  
  @Get('/day')
  async getDays() {
    return this.dayTemplateModel.find({})
  }

  @Post('/day')
  async createDayTemplate(@BodyParams() template: Partial<DayTemplate>) {
    return this.dayTemplateModel.create({ ...template });
  }

  @Delete('/day/:id')
  async deleteDayTemplate(@PathParams('id') id: string) {
    return this.dayTemplateModel.findByIdAndDelete(id);
  }

  @Get('/task')
  async getTasks() {
    return this.contextTemplateModel.find({})
  }

  @Post('/task')
  async createTaskTemplate(@BodyParams() template: Partial<TaskTemplate>) {
    return this.taskTemplateModel.create({ ...template });
  }

  @Delete('/task/:id')
  async deleteTaskTemplate(@PathParams('id') id: string) {
    return this.taskTemplateModel.findByIdAndDelete(id);
  }

  // Context
  @Get('/context')
  async getContexts() {
    return this.contextTemplateModel.find({})
  }

  @Post('/context')
  async createContexts(@BodyParams() contextTemplate: Partial<ContextTemplate>) {
    return this.contextTemplateModel.create({ ...contextTemplate })
  }

  @Patch('/context/:id')
  async updateContexts(@PathParams('id') _id: string, @BodyParams() contextTemplate: Partial<ContextTemplate>) {
    log("patch context")
    log("id", _id)
    return this.contextTemplateModel.findByIdAndUpdate(_id, { ...contextTemplate }, { new: true });
  }

  @Delete('/context/:id')
  async deleteContexts(@PathParams('id') id: string) {
    return this.contextTemplateModel.deleteOne({ _id: id })
  }

  // MiniContext
  @Get('/mini-context')
  async getMiniContexts() {
    return this.miniContextTemplateModel.find({})
  }

  @Post('/mini-context')
  async createMiniContexts(@BodyParams() miniContextTemplate: Partial<MiniContextTemplate>) {
    return this.miniContextTemplateModel.create({ ...miniContextTemplate })
  }

  @Patch('/mini-context-templates/:id')
  async updateMiniContexts(@PathParams('id') id: string, @BodyParams() miniCcontextTemplate: Partial<MiniContextTemplate>) {
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
