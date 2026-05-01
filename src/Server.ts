import { PlatformApplication } from "@tsed/common";
import { Configuration, Inject } from "@tsed/di";
import '@tsed/mongoose';
import "@tsed/platform-express";
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import 'dotenv/config';
import methodOverride from "method-override";
import * as controllers from "../src/controllers";

@Configuration({
  rootDir: __dirname,
  acceptMimes: ["application/json"],
  httpPort: 3002,
  /*httpsPort: process.env.PORT || 443,
  httpsOptions: {
    key: readFileSync(join(__dirname, "../certs/key.pem")),
    cert: readFileSync(join(__dirname, "../certs/cert.pem"))
  },*/
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
