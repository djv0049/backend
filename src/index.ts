import { $log } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { Server } from "./Server";


async function bootstrap() {
  try {
    const platform = await PlatformExpress.bootstrap(Server);
    // Add this:
    // after bootstrap:
    const injector = platform.injector;
    const controllers = injector.getProviders('controller');
    console.log('🎮 Registered controllers:', controllers.map((c: any) => c.token?.name));
    await platform.listen();

    $log.info("Server initialized");
  } catch (err: any) {
    $log.error({ event: "SERVER_BOOTSTRAP_ERROR", message: err.message, stack: err.stack });
  }
}

bootstrap();

