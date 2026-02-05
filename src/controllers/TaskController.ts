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

  @Post("/")
  async create(@BodyParams() body: CreateTaskDto): Promise<Task> {
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
