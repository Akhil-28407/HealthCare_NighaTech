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

      console.log('--- 🚀 STAGE 4: Initializing Swagger ---');
      const config = new DocumentBuilder()
        .setTitle('Healthcare API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      
      // Fix: Use CDN for Swagger assets to avoid 404s on Vercel
      SwaggerModule.setup('api/docs', app, document, {
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.min.css',
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js',
        ],
      });

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
  // 1. Immediate Preflight Handler to prevent CORS 500s during bootstrap
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // 2. Global CORS Fallback for other methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');


  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error('--- ❌ HANDLER FAILURE ---');
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error during bootstrap',
        error: message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
