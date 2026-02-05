import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/common";
import "@tsed/platform-express";
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import '@tsed/mongoose'
import * as controllers from "../src/controllers"
import { readFileSync } from "fs";
import { join } from "path";
import 'dotenv/config';

console.log(process.env.MONGO_URL)
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
  mongoose: [
    {
      id: 'default',
      url: process.env.MONGO_URL || '',
      connectionOptions: {},
    },
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
