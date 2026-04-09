"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("../src/app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedServer;
async function bootstrap() {
    if (!cachedServer) {
        const expressApp = (0, express_1.default)();
        const adapter = new platform_express_1.ExpressAdapter(expressApp);
        const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter);
        app.enableCors({
            origin: true,
            credentials: true,
        });
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }));
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Healthcare Lab Management API')
            .setDescription('API for Healthcare & Medical Laboratory Management System')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        await app.init();
        cachedServer = expressApp;
    }
    return cachedServer;
}
exports.default = async (req, res) => {
    const server = await bootstrap();
    server(req, res);
};
//# sourceMappingURL=index.js.map