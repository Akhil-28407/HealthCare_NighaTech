import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { LabReport, LabReportDocument, ReportStatus } from './schemas/lab-report.schema';
import { TestOrder, TestOrderDocument, TestOrderStatus } from '../test-orders/schemas/test-order.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class LabReportsService {
  constructor(
    @InjectModel(LabReport.name) private reportModel: Model<LabReportDocument>,
    @InjectModel(TestOrder.name) private orderModel: Model<TestOrderDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private configService: ConfigService,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  async findAll(query: any = {}, user: any): Promise<any> {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      const { status, clientId, testOrderId, branchId, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const filter: any = {};
      
      // Role based filtering
      if (user.role === Role.CLIENT) {
        const clients = await this.clientModel.find({ mobile: user.mobile }).lean();
        if (clients.length > 0) {
          const clientIds = clients.map(c => c._id);
          filter.clientId = { $in: clientIds };
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

      if (clientId && Types.ObjectId.isValid(clientId)) filter.clientId = new Types.ObjectId(clientId);
      if (testOrderId && Types.ObjectId.isValid(testOrderId)) filter.testOrderId = new Types.ObjectId(testOrderId);
      if (status && status !== '') filter.status = status;

      if (search) {
        // Search by report number OR find clients by name and search by their IDs
        const clientsWithName = await this.clientModel.find({ name: { $regex: search, $options: 'i' } }).select('_id').lean();
        const clientIds = clientsWithName.map(c => c._id);
        
        filter.$or = [
          { reportNumber: { $regex: search, $options: 'i' } },
          { clientId: { $in: clientIds } }
        ];
      }

      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      console.log(`[LabReports] FindAll filters:`, JSON.stringify(filter));

      const [reports, total] = await Promise.all([
        this.reportModel.find(filter)
          .populate('clientId', 'name mobile')
          .populate('testId', 'name category')
          .populate('testOrderId', 'orderNumber netAmount')
          .populate('branchId', 'name')
          .populate('enteredBy', 'name')
          .populate('verifiedBy', 'name')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort(sort)
          .lean(),
        this.reportModel.countDocuments(filter),
      ]);

      // Optimization: Fetch all related invoices at once and use a Map for O(1) lookup
      const getOrderId = (order: any) => {
        if (!order) return null;
        return (order._id || order).toString();
      };

      const orderIds = reports.map(r => r.testOrderId).filter(Boolean);
      const invoices = await this.invoiceModel.find({ testOrderId: { $in: orderIds } }).lean();
      const invoiceMap = new Map(invoices.map(inv => [inv.testOrderId?.toString(), inv]));
      
      const reportsWithPayment = reports.map(r => {
        const orderIdStr = getOrderId(r.testOrderId);
        const inv: any = invoiceMap.get(orderIdStr);
        
        return {
          ...r,
          payment: {
            paidAmount: inv?.paidAmount || 0,
            balance: inv ? (inv.balance ?? inv.total) : (r.testOrderId && typeof r.testOrderId === 'object' && 'netAmount' in r.testOrderId ? (r.testOrderId as any).netAmount : 0),
            status: inv?.status || 'NONE'
          }
        };
      });

      return { reports: reportsWithPayment, total, page, limit };
    } catch (error) {
      console.error('[LabReportsService.findAll] Error:', error.message);
      throw error;
    }
  }

  async findById(id: string): Promise<any> {
    const report = await this.reportModel.findById(id)
      .populate('clientId', 'name email mobile age gender address')
      .populate('testId', 'name code category sampleType parameters')
      .populate('testOrderId', 'orderNumber sampleCollectedAt netAmount')
      .populate('branchId', 'name address phone email labName labLicense')
      .populate('enteredBy', 'name')
      .populate('verifiedBy', 'name')
      .lean();

    if (!report) throw new NotFoundException('Lab report not found');
    
    // Attach payment status
    const inv = await this.invoiceModel.findOne({ testOrderId: report.testOrderId?._id || report.testOrderId }).lean();
    const reportWithPayment = {
      ...report,
      payment: {
        paidAmount: inv?.paidAmount || 0,
        balance: inv ? (inv.balance ?? inv.total) : (typeof report.testOrderId === 'object' && report.testOrderId !== null && 'netAmount' in report.testOrderId ? (report.testOrderId as any).netAmount : 0),
        status: inv?.status || 'NONE'
      }
    };

    return reportWithPayment;
  }

  async updateResults(id: string, results: any[], userId: string, htmlContent?: string) {
    const report = await this.reportModel.findById(id);
    if (!report) throw new NotFoundException('Lab report not found');
    if (report.status === ReportStatus.VERIFIED) {
      throw new BadRequestException('Cannot modify a verified report');
    }

    // Payment Guard: Partial payment required to enter results
    const invoice = await this.invoiceModel.findOne({ testOrderId: report.testOrderId }).lean();
    if (!invoice || (invoice.paidAmount || 0) <= 0) {
      throw new BadRequestException('At least partial payment is required to enter test results');
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
    
    try {
      await report.save();
      return report;
    } catch (saveError: any) {
      console.error(`[LabReports] Update failed for report ${id}:`, saveError.message);
      if (saveError.name === 'ValidationError') {
        throw new BadRequestException(`Validation Error: ${Object.keys(saveError.errors).join(', ')}`);
      }
      throw saveError;
    }
  }

  async verifyReport(id: string, userId: string) {
    const report = await this.reportModel.findById(id);
    if (!report) throw new NotFoundException('Lab report not found');
    const hasContent = (report.results && report.results.length > 0) || (report.htmlContent && report.htmlContent.trim() !== '');
    
    // Loosen the check: As long as there is content, allow verification even if status is PENDING
    // This resolves issues where status updates might lag behind data entry.
    if (!hasContent && report.status === ReportStatus.PENDING) {
      throw new BadRequestException('Report must have results entered before verification');
    }

    // Payment Guard: Full payment required to verify/generate PDF
    const invoice = await this.invoiceModel.findOne({ testOrderId: report.testOrderId }).lean();
    if (!invoice || (invoice.balance || 0) > 0) {
      throw new BadRequestException('Full payment is required to verify the report and generate PDF');
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

    // Automated email sending is currently disabled per user request.
    // Manual sending remains available in the reports dashboard.
    // this.sendReportEmail(id).catch(e => 
    //   console.error(`[LabReports] Background email failed for report ${id}:`, e.message)
    // );

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
