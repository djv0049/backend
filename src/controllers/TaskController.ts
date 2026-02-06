import { Inject, Controller, Post, BodyParams, Get } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Task } from "../entities/Task";

export class CreateTaskDto {
  name!: string;
  priority!: number;
  startTime?: Date;
  endTime?: Date;
}

@Controller("/task")
export class TaskController {
  @Inject(Task)
  private taskModel!: MongooseModel<Task>;

  @Get("/")
  async getAllTasks() {
    const all = await this.taskModel.find()
    console.log(all)
    return all
  }
  @Post("/")
  async create(@BodyParams() body:JSON): Promise<Task> {
    console.log(body)
    return await this.taskModel.create({
      ...body,
      createdAt: new Date()
    });
  }

  @Get("/test")
  async test() {
    return {working:"yes"}
  }
}
