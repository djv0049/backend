import { Controller, Get, Post, BodyParams, PathParams, Inject } from "@tsed/common";
import { EntityManager } from "@mikro-orm/core";
import { User } from "../entities/User";

@Controller("/users")
export class UserController {
  @Inject()
  private em!: EntityManager;

  @Get("/")
  async getAll(): Promise<User[]> {
    return this.em.fork().find(User, {});
  }

  @Get("/:id")
  async getById(@PathParams("id") id: number): Promise<User | null> {
    return this.em.fork().findOne(User, { id });
  }

  @Post("/")
  async create(@BodyParams() body: { name: string; email: string }): Promise<User> {
    const em = this.em.fork();
    const user = em.create(User, {
      ...body,
      createdAt: new Date()
    });
    await em.persistAndFlush(user);
    return user;
  }
}
