import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceStatus } from './schemas/invoice.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { CounterService } from '../counter/counter.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private counterService: CounterService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async create(dto: any) {
    const invoiceNumber = await this.counterService.generateNumber('INV', 'invoice');
    const items = (dto.items || []).map(item => ({
      ...item,
      amount: (item.quantity || 1) * item.unitPrice,
    }));
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const total = subtotal + (dto.tax || 0) - (dto.discount || 0);

    return this.invoiceModel.create({
      ...dto,
      invoiceNumber,
      items,
      subtotal,
      total,
    });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, clientId } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;

    const [invoices, total] = await Promise.all([
      this.invoiceModel.find(filter)
        .populate('clientId', 'name email mobile')
        .populate('branchId', 'name')
        .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
      this.invoiceModel.countDocuments(filter),
    ]);
    return { invoices, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const invoice = await this.invoiceModel.findById(id)
      .populate('clientId', 'name email mobile address')
      .populate('branchId', 'name address phone email labName labLicense')
      .lean();
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async send(id: string) {
    const invoice = await this.invoiceModel.findById(id).populate('clientId', 'name email');
    if (!invoice) throw new NotFoundException('Invoice not found');

    const client = invoice.clientId as any;
    if (client?.email) {
      const viewUrl = `${this.configService.get('app.frontendUrl')}/invoices/${id}`;
      await this.mailService.sendInvoice(client.email, client.name, invoice.invoiceNumber, viewUrl);
    }

    invoice.status = InvoiceStatus.SENT;
    invoice.sentAt = new Date();
    await invoice.save();

    return { success: true, message: 'Invoice sent' };
  }

  async markPaid(id: string) {
    const invoice = await this.invoiceModel.findByIdAndUpdate(
      id,
      { status: InvoiceStatus.PAID, paidAt: new Date() },
      { new: true },
    );
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }
}
