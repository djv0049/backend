import { Controller, Get, Post, BodyParams, PathParams } from "@tsed/common";
import { EntityManager } from "@mikro-orm/core";
import { Task } from "../entities/Task";

@Controller("/task")
export class TaskController {
  constructor(private em: EntityManager) {}
  @Get('/test')
  async getTest(): Promise<any> {
    return "This is a test"
  }

  @Get("/")
  async getAll(): Promise<Task[]> {
    return this.em.fork().find(Task, {});
  }

  @Get("/:id")
  async getById(@PathParams("id") id: number): Promise<Task | null> {
    return this.em.fork().findOne(Task, { id });
  }

  @Post("/")
  async create(@BodyParams() body: { name: string; startTime: Date, endTime: Date, priority: number }): Promise<Task> {
    const em = this.em.fork();
    const task = em.create(Task, {
      ...body,
      createdAt: new Date()
    });
    await em.persistAndFlush(task);
    return task;
  }
}
