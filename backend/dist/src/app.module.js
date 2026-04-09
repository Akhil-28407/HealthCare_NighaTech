"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = __importDefault(require("./config/configuration"));
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const branches_module_1 = require("./modules/branches/branches.module");
const clients_module_1 = require("./modules/clients/clients.module");
const test_master_module_1 = require("./modules/test-master/test-master.module");
const test_orders_module_1 = require("./modules/test-orders/test-orders.module");
const lab_reports_module_1 = require("./modules/lab-reports/lab-reports.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const quotations_module_1 = require("./modules/quotations/quotations.module");
const templates_module_1 = require("./modules/templates/templates.module");
const audit_log_module_1 = require("./modules/audit-log/audit-log.module");
const counter_module_1 = require("./modules/counter/counter.module");
const pdf_module_1 = require("./modules/pdf/pdf.module");
const mail_module_1 = require("./modules/mail/mail.module");
const sms_module_1 = require("./modules/sms/sms.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    uri: configService.get('app.mongodbUri'),
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            sessions_module_1.SessionsModule,
            branches_module_1.BranchesModule,
            clients_module_1.ClientsModule,
            test_master_module_1.TestMasterModule,
            test_orders_module_1.TestOrdersModule,
            lab_reports_module_1.LabReportsModule,
            invoices_module_1.InvoicesModule,
            quotations_module_1.QuotationsModule,
            templates_module_1.TemplatesModule,
            audit_log_module_1.AuditLogModule,
            counter_module_1.CounterModule,
            pdf_module_1.PdfModule,
            mail_module_1.MailModule,
            sms_module_1.SmsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map