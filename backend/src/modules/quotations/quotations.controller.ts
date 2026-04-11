import { Controller, Get, Post, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { QuotationsService } from './quotations.service';
import { PdfService } from '../pdf/pdf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Quotations')
@Controller('quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuotationsController {
  constructor(
    private readonly service: QuotationsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Create quotation' })
  create(@Body() dto: any) { return this.service.create(dto); }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Get all quotations' })
  findAll(@Query() query: any, @CurrentUser() user: any) { 
    return this.service.findAll(query, user); 
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Get quotation by ID' })
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download quotation as PDF' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const quotation = await this.service.findById(id);
    const pdfBuffer = await this.pdfService.generateInvoicePdf(quotation, 'QUOTATION');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=quotation-${quotation.quotationNumber}.pdf`,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/send')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Send quotation via email' })
  send(@Param('id') id: string) { return this.service.send(id); }

  @Post(':id/convert')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Convert quotation to invoice' })
  convert(@Param('id') id: string) { return this.service.convertToInvoice(id); }
}
