import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/common";
import "@tsed/platform-express";
import "@tsed/mikro-orm";
import { SqliteDriver } from "@mikro-orm/sqlite";
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";

@Configuration({
  rootDir: __dirname,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 3000,
  httpsPort: false,
  disableComponentsScan: false,
  mount: {
    "/api": [`${__dirname}/controllers/**/*.ts`]
  },
  mikroOrm: [
    {
      contextName: "default",
      driver: SqliteDriver,
      dbName: "./db.sqlite",
      entities: ["./dist/entities/**/*.js"],
      entitiesTs: ["./src/entities/**/*.ts"]
    }
  ],
  middlewares: [
    cors(),
    cookieParser(),
    compress({}),
    methodOverride(),
    bodyParser.json(),
    bodyParser.urlencoded({
      extended: true
    })
  ]
})
export class Server {
  @Inject()
  protected app!: PlatformApplication;

  @Inject()
  protected settings!: Configuration;
}
