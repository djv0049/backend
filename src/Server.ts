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
import * as controllers from "../src/controllers"
import { readFileSync } from "fs";
import { join } from "path";

@Configuration({
  rootDir: __dirname,
  acceptMimes: ["application/json"],
  httpPort: 3002,
  httpsPort: process.env.PORT || 443,
  httpsOptions: {
    key: readFileSync(join(__dirname, "../certs/key.pem")),
    cert: readFileSync(join(__dirname, "../certs/cert.pem"))
  },
  disableComponentsScan: false,
  mount: {
    '/': [...Object.values(controllers)],
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
