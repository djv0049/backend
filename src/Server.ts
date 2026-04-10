import 'dotenv/config';  // 👈 must be first, before everything else
import { PlatformApplication } from "@tsed/common";
import { Configuration, Inject } from "@tsed/di";
import '@tsed/mongoose';
import "@tsed/platform-express";
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import methodOverride from "method-override";

import * as controllers from './controllers';
console.log('🔍 Controllers Module:', Object.keys(controllers));


// In the Configuration, add logging
console.log("URL", process.env.MONGO_URL)
@Configuration({
  rootDir: __dirname,
  acceptMimes: ["application/json"],
  httpPort: 3002,
  /*httpsPort: process.env.PORT || 443,
  httpsOptions: {
    key: readFileSync(join(__dirname, "../certs/key.pem")),
    cert: readFileSync(join(__dirname, "../certs/cert.pem"))
  },*/
  disableComponentsScan: true,
  mount: {
    '/': [...Object.values(controllers)]
  },

  /*mount: {
    '/': [ScheduleController], // Hardcode them
  },*/
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
