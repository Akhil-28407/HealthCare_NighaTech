import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quotation, QuotationSchema } from './schemas/quotation.schema';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { Branch, BranchSchema } from '../branches/schemas/branch.schema';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { CounterModule } from '../counter/counter.module';
import { MailModule } from '../mail/mail.module';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quotation.name, schema: QuotationSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
    CounterModule,
    MailModule,
    PdfModule,
    AuthModule,
  ],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
