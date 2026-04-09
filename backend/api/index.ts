import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    try {
      console.log('🚀 Initializing serverless NestJS backend...');
      
      // Check for critical env vars
      if (!process.env.MONGODB_URI) {
        console.warn('⚠️  WARNING: MONGODB_URI is not set. Falling back to localhost (likely to fail on Vercel).');
      }

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
      console.log('✅ NestJS app initialized successfully.');
      cachedServer = expressApp;
    } catch (error) {
      console.error('❌ CRITICAL ERROR during NestJS bootstrap:', error);
      throw error;
    }
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error('❌ Request handling failed:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error during bootstrap',
      error: error.message,
    });
  }
};
