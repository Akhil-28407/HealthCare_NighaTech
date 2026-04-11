import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Quotation, QuotationDocument, QuotationStatus } from './schemas/quotation.schema';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { CounterService } from '../counter/counter.service';
import { MailService } from '../mail/mail.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectModel(Quotation.name) private quotationModel: Model<QuotationDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private counterService: CounterService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async create(dto: any) {
    const quotationNumber = await this.counterService.generateNumber('QUO', 'quotation');
    const items = (dto.items || []).map(item => ({
      ...item,
      amount: (item.quantity || 1) * item.unitPrice,
    }));
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const total = subtotal + (dto.tax || 0) - (dto.discount || 0);

    return this.quotationModel.create({ ...dto, quotationNumber, items, subtotal, total });
  }

  async findAll(query: any = {}, user?: any) {
    const { page = 1, limit = 20, status, clientId, branchId } = query;
    const filter: any = {};
    
    // Role-based branch isolation
    if (user && (user.role === Role.LAB || user.role === 'LAB_EMP')) {
      if (user.branchId && Types.ObjectId.isValid(user.branchId)) {
        filter.branchId = user.branchId;
      }
    } else if (branchId && Types.ObjectId.isValid(branchId)) {
      filter.branchId = branchId;
    }

    if (status) filter.status = status;
    if (clientId && Types.ObjectId.isValid(clientId)) filter.clientId = clientId;

    const [quotations, total] = await Promise.all([
      this.quotationModel.find(filter)
        .populate('clientId', 'name email mobile')
        .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
      this.quotationModel.countDocuments(filter),
    ]);
    return { quotations, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const quotation = await this.quotationModel.findById(id)
      .populate('clientId', 'name email mobile address')
      .populate('branchId', 'name address phone email labName labLicense')
      .lean();
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async send(id: string) {
    const quotation = await this.quotationModel.findById(id).populate('clientId', 'name email');
    if (!quotation) throw new NotFoundException('Quotation not found');

    const client = quotation.clientId as any;
    if (client?.email) {
      const viewUrl = `${this.configService.get('app.frontendUrl')}/quotations/${id}`;
      await this.mailService.sendQuotation(client.email, client.name, quotation.quotationNumber, viewUrl);
    }

    quotation.status = QuotationStatus.SENT;
    quotation.sentAt = new Date();
    await quotation.save();

    return { success: true, message: 'Quotation sent' };
  }

  async convertToInvoice(id: string) {
    const quotation = await this.quotationModel.findById(id);
    if (!quotation) throw new NotFoundException('Quotation not found');
    if (quotation.status === QuotationStatus.CONVERTED) {
      throw new NotFoundException('Quotation already converted');
    }

    const invoiceNumber = await this.counterService.generateNumber('INV', 'invoice');
    const invoice = await this.invoiceModel.create({
      invoiceNumber,
      clientId: quotation.clientId,
      branchId: quotation.branchId,
      quotationId: quotation._id,
      items: quotation.items,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      discount: quotation.discount,
      total: quotation.total,
    });

    quotation.status = QuotationStatus.CONVERTED;
    await quotation.save();

    return invoice;
  }
}
