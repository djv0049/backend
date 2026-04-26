/*import { Inject, Controller, Post, BodyParams, Get, Put, Delete } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Task } from "../entities/Task";
import { error } from "console";

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
    return await this.taskModel.find()
  }
  @Post("/")
  async create(@BodyParams() body: JSON): Promise<Task> {
    return await this.taskModel.create({
      ...body,
      createdAt: new Date()
    });
  }

  @Put("/")
  async updateTask(@BodyParams() body: Task): Promise<Task | null> {
    const filter = { _id: body._id }
    const updates = { $set: body }
    const result = await this.taskModel.updateOne(filter, updates)
    if (result.acknowledged)
      return body
    else return null
  }

  @Delete("/")
  async deleteTask(@BodyParams() body: Task): Promise<Task | null> {
    const filter = { _id: body._id }
    const updates = { $set: body }
    const result = await this.taskModel.deleteOne(filter, updates)
    if (result.acknowledged)
      return body
    else return null
  }

  @Get("/test")
  async test() {
    return { working: "yes" }
  }
}*/
