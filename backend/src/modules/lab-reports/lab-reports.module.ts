import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LabReport, LabReportSchema } from './schemas/lab-report.schema';
import { TestOrder, TestOrderSchema } from '../test-orders/schemas/test-order.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { LabReportsService } from './lab-reports.service';
import { LabReportsController } from './lab-reports.controller';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LabReport.name, schema: LabReportSchema },
      { name: TestOrder.name, schema: TestOrderSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
    PdfModule,
    AuthModule,
  ],
  controllers: [LabReportsController],
  providers: [LabReportsService],
  exports: [LabReportsService, MongooseModule],
})
export class LabReportsModule {}
