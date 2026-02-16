import { Inject, Controller, Post, BodyParams, Get, Put } from "@tsed/common";
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

  @Put("/")
  async updateTask(@BodyParams() body: Task): Promise<Task|null>{
    const filter = {_id: body._id}
    const updates = {$set:body}
    console.log("UPDATE:",body)
    const result =await this.taskModel.updateOne( filter, updates  )
    if (result.acknowledged)
      return body
    else return null


  }

  @Get("/test")
  async test() {
    return {working:"yes"}
  }
}
