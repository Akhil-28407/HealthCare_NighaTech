import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ClientsModule } from './modules/clients/clients.module';
import { TestMasterModule } from './modules/test-master/test-master.module';
import { TestOrdersModule } from './modules/test-orders/test-orders.module';
import { LabReportsModule } from './modules/lab-reports/lab-reports.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { CounterModule } from './modules/counter/counter.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { MailModule } from './modules/mail/mail.module';
import { SmsModule } from './modules/sms/sms.module';
import { SeedModule } from './modules/seed/seed.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('app.mongodbUri'),
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000, // Frequent heartbeats keep connection alive in serverless
        autoIndex: process.env.NODE_ENV !== 'production',
        maxPoolSize: 10,
        minPoolSize: 1, // Maintain at least one connection
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    SessionsModule,
    BranchesModule,
    ClientsModule,
    TestMasterModule,
    TestOrdersModule,
    LabReportsModule,
    InvoicesModule,
    QuotationsModule,
    TemplatesModule,
    AuditLogModule,
    CounterModule,
    PdfModule,
    MailModule,
    SmsModule,
    SeedModule,
    UploadModule,
  ],
})
export class AppModule {}
