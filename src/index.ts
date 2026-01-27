import { $log } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { Server } from "./Server";

async function bootstrap() {
  try {
    const platform = await PlatformExpress.bootstrap(Server);
    await platform.listen();
    
    $log.info("Server initialized");
  } catch (err: any) {
    $log.error({ event: "SERVER_BOOTSTRAP_ERROR", message: err.message, stack: err.stack });
  }
}

bootstrap();
