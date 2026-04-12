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
import 'dotenv/config'; // 👈 must be first, before everything else

console.log("Starting Server...");
console.log("MONGO_URL:", process.env.MONGO_URL ? "✅ Set" : "❌ Missing");

console.log(process.env.MONGO_URL)
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
    '/': [...Object.values(controllers)]
  },

  mongoose: [
    {
      id: 'default',
      url: process.env.MONGO_URL || '',
      connectionOptions: {
      },
    },
  ],
  middlewares: [
    cors({
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    cookieParser(),
    compress({}),
    methodOverride()
  ]
})
export class Server {
  @Inject()
  protected app!: PlatformApplication;

  @Inject()
  protected settings!: Configuration;
}
