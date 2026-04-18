import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LabReport, LabReportSchema } from './schemas/lab-report.schema';
import { TestOrder, TestOrderSchema } from '../test-orders/schemas/test-order.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Branch, BranchSchema } from '../branches/schemas/branch.schema';
import { TestMaster, TestMasterSchema } from '../test-master/schemas/test-master.schema';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { LabReportsService } from './lab-reports.service';
import { LabReportsController } from './lab-reports.controller';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LabReport.name, schema: LabReportSchema },
      { name: TestOrder.name, schema: TestOrderSchema },
      { name: Client.name, schema: ClientSchema },
      { name: User.name, schema: UserSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: TestMaster.name, schema: TestMasterSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    PdfModule,
    AuthModule,
    MailModule,
  ],
  controllers: [LabReportsController],
  providers: [LabReportsService],
  exports: [LabReportsService, MongooseModule],
})
export class LabReportsModule {}
