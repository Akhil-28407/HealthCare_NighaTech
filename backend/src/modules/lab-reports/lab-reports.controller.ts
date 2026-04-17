import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { LabReportsService } from './lab-reports.service';
import { PdfService } from '../pdf/pdf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Lab Reports')
@Controller('lab-reports')
export class LabReportsController {
  constructor(
    private readonly service: LabReportsService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all lab reports' })
  findAll(@Query() query: any, @CurrentUser() user: any) { 
    return this.service.findAll(query, user); 
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lab report by ID (public for verified reports)' })
  findById(@Param('id') id: string) { 
    return this.service.findById(id); 
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download lab report as PDF' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const report = await this.service.findById(id);
    const pdfBuffer = await this.pdfService.generateLabReportPdf(report);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report-${report.reportNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Patch(':id/results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB, Role.LAB_EMP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enter/update test results' })
  updateResults(
    @Param('id') id: string,
    @Body('results') results: any[],
    @Body('htmlContent') htmlContent: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.updateResults(id, results, userId, htmlContent);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB, Role.LAB_EMP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify lab report' })
  verify(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.verifyReport(id, userId);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB, Role.LAB_EMP)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually send lab report via email' })
  send(@Param('id') id: string) {
    return this.service.sendReportEmail(id);
  }
}
