import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    try {
      console.log('--- 🚀 STAGE 1: Serverless Bootstrap (Source Root) ---');
      console.log(`- Time: ${new Date().toISOString()}`);
      console.log(`- Node Version: ${process.version}`);

      const expressApp = express();
      const adapter = new ExpressAdapter(expressApp);
      const app = await NestFactory.create(AppModule, adapter);

      console.log('--- 🚀 STAGE 3: Configuring Middlewares ---');
      app.enableCors({ origin: true, credentials: true });
      app.setGlobalPrefix('api');
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

      // Swagger disabled for serverless to reduce bundle issues
      /*
      console.log('--- 🚀 STAGE 4: Initializing Swagger ---');
      const config = new DocumentBuilder()
        .setTitle('Healthcare API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      */

      console.log('--- 🚀 STAGE 5: Running app.init() with 20s Timeout ---');
      await Promise.race([
        app.init(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('NestJS init timeout after 20s')), 20000))
      ]);
      
      console.log('--- ✅ STAGE 6: Bootstrap Complete! ---');
      cachedServer = expressApp;
    } catch (error) {
      console.error('--- ❌ CRITICAL BOOTSTRAP FAILURE ---');
      console.error(error);
      throw error;
    }
  }
  return cachedServer;
}

export const handler = async (req: any, res: any) => {
  // CORS Fallback
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error('--- ❌ HANDLER FAILURE ---');
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error during bootstrap',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
