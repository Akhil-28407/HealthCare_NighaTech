import { Controller, Get, Post, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { PdfService } from '../pdf/pdf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(
    private readonly service: InvoicesService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Create invoice' })
  create(@Body() dto: any) { return this.service.create(dto); }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Get all invoices' })
  findAll(@Query() query: any, @CurrentUser() user: any) { 
    return this.service.findAll(query, user); 
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Get invoice by ID' })
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice as PDF (Public link)' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.service.findById(id);
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice, 'INVOICE');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/send')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Send invoice via email' })
  send(@Param('id') id: string) { return this.service.send(id); }

  @Post(':id/mark-paid')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Mark invoice as paid' })
  markPaid(@Param('id') id: string) { return this.service.markPaid(id); }
}
