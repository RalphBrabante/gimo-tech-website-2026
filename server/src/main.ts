import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureHttp, prepareRenderEnvironment } from './http-setup';

async function bootstrap() {
  const dev = process.env.NODE_ENV !== 'production';
  const port = Number(process.env.PORT) || 3000;
  prepareRenderEnvironment(port);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: dev ? undefined : ['error', 'warn', 'log']
  });
  const site = await configureHttp(app, { dev, port });

  app.enableShutdownHooks();
  process.once('beforeExit', () => void site.close());
  await app.listen(port, '0.0.0.0');
  console.log(`Gimo Tech Supplies (NestJS API + Next.js website) listening on port ${port}${dev ? ' [development]' : ''}`);
}

void bootstrap();
