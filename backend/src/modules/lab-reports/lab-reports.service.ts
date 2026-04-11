import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { LabReport, LabReportDocument, ReportStatus } from './schemas/lab-report.schema';
import { TestOrder, TestOrderDocument, TestOrderStatus } from '../test-orders/schemas/test-order.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { Role } from '../../common/enums/role.enum';

import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class LabReportsService {
  constructor(
    @InjectModel(LabReport.name) private reportModel: Model<LabReportDocument>,
    @InjectModel(TestOrder.name) private orderModel: Model<TestOrderDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private configService: ConfigService,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  async findAll(query: any = {}, user: any) {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      const { status, clientId, testOrderId, branchId } = query;
      const filter: any = {};
      
      // Role based filtering
      if (user.role === Role.CLIENT) {
        const client = await this.clientModel.findOne({ userId: user.sub }).lean();
        if (client) {
          filter.clientId = client._id;
          if (!status) filter.status = ReportStatus.VERIFIED;
        } else {
          return { reports: [], total: 0, page, limit };
        }
      } else if (user.role === Role.LAB || user.role === Role.LAB_EMP) {
        if (user.branchId && Types.ObjectId.isValid(user.branchId)) {
          filter.branchId = user.branchId;
        }
      } else if (branchId && Types.ObjectId.isValid(branchId)) {
        filter.branchId = branchId;
      }

      // Robust check for other filters (prevent empty string cast errors)
      if (clientId && Types.ObjectId.isValid(clientId)) filter.clientId = clientId;
      if (testOrderId && Types.ObjectId.isValid(testOrderId)) filter.testOrderId = testOrderId;
      if (status && status !== '') filter.status = status;

      const [reports, total] = await Promise.all([
        this.reportModel.find(filter)
          .populate('clientId', 'name email mobile age gender')
          .populate('testId', 'name code category')
          .populate('testOrderId', 'orderNumber')
          .populate('branchId', 'name')
          .populate('enteredBy', 'name')
          .populate('verifiedBy', 'name')
          .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
        this.reportModel.countDocuments(filter),
      ]);
      return { reports, total, page, limit };
    } catch (error) {
      console.error('[LabReportsService.findAll] Error:', error.message);
      throw error;
    }
  }

  async findById(id: string) {
    const report = await this.reportModel.findById(id)
      .populate('clientId', 'name email mobile age gender address')
      .populate('testId', 'name code category sampleType parameters')
      .populate('testOrderId', 'orderNumber sampleCollectedAt')
      .populate('branchId', 'name address phone email labName labLicense')
      .populate('enteredBy', 'name')
      .populate('verifiedBy', 'name')
      .lean();
    if (!report) throw new NotFoundException('Lab report not found');
    return report;
  }

  async updateResults(id: string, results: any[], userId: string, htmlContent?: string) {
    const report = await this.reportModel.findById(id);
    if (!report) throw new NotFoundException('Lab report not found');
    if (report.status === ReportStatus.VERIFIED) {
      throw new BadRequestException('Cannot modify a verified report');
    }

    if (results && Array.isArray(results)) {
      // Auto-detect flags
      const flaggedResults = results.map(r => {
        let flag = 'N';
        const numValue = parseFloat(r.value);
        if (!isNaN(numValue)) {
          if (r.normalRangeMin != null && numValue < r.normalRangeMin) flag = 'L';
          else if (r.normalRangeMax != null && numValue > r.normalRangeMax) flag = 'H';
        }
        return { ...r, flag };
      });
      report.results = flaggedResults;
    }

    if (htmlContent !== undefined) {
      report.htmlContent = htmlContent;
    }

    report.status = ReportStatus.RESULTS_ENTERED;
    
    // Ensure valid ObjectId for enteredBy
    if (userId && Types.ObjectId.isValid(userId)) {
      report.enteredBy = new Types.ObjectId(userId);
    }
    
    await report.save();
    return report;
  }

  async verifyReport(id: string, userId: string) {
    const report = await this.reportModel.findById(id);
    if (!report) throw new NotFoundException('Lab report not found');
    if (report.status !== ReportStatus.RESULTS_ENTERED) {
      throw new BadRequestException('Report must have results entered before verification');
    }

    // Generate QR code
    const reportUrl = `${this.configService.get('app.frontendUrl')}/reports/${id}`;
    const qrCode = await QRCode.toDataURL(reportUrl);

    report.status = ReportStatus.VERIFIED;
    report.verifiedBy = new Types.ObjectId(userId);
    report.verifiedAt = new Date();
    report.qrCode = qrCode;
    await report.save();

    // Check if all reports for the order are verified
    const allReports = await this.reportModel.find({ testOrderId: report.testOrderId });
    const allVerified = allReports.every(r => r.status === ReportStatus.VERIFIED);
    if (allVerified) {
      await this.orderModel.findByIdAndUpdate(report.testOrderId, {
        status: TestOrderStatus.COMPLETED,
      });
    }

    // TRIGGER AUTOMATED EMAIL
    try {
      await this.sendReportEmail(id);
    } catch (e) {
      console.error('Failed to send automated report email:', e.message);
    }

    return report;
  }

  async sendReportEmail(id: string) {
    const report = await this.findById(id);
    if (report.status !== ReportStatus.VERIFIED) {
      throw new BadRequestException('Report must be verified before sending');
    }

    const client = report.clientId as any;
    if (!client?.email) {
      throw new BadRequestException('Patient email not found');
    }

    const pdfBuffer = await this.pdfService.generateLabReportPdf(report);
    await this.mailService.sendLabReport(
      client.email,
      client.name,
      report.reportNumber,
      pdfBuffer
    );

    return { success: true, message: 'Report email sent successfully' };
  }
}
