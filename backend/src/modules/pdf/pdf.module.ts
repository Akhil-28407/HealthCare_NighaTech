import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfService } from './pdf.service';
import { ReportTemplate, ReportTemplateSchema } from '../templates/schemas/report-template.schema';
import { Branch, BranchSchema } from '../branches/schemas/branch.schema';
import { TestOrder, TestOrderSchema } from '../test-orders/schemas/test-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportTemplate.name, schema: ReportTemplateSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: TestOrder.name, schema: TestOrderSchema },
    ]),
  ],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
