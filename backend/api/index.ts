import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);

    // CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('Healthcare Lab Management API')
      .setDescription('API for Healthcare & Medical Laboratory Management System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  const server = await bootstrap();
  server(req, res);
};
