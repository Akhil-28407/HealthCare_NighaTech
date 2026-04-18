import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Types, Model } from 'mongoose';
import { Role } from '../../common/enums/role.enum';
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
    if (!dto.clientId || !Types.ObjectId.isValid(dto.clientId)) {
      throw new BadRequestException('Valid clientId is required');
    }

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
      balance: total, // Initialize balance to total
    });
  }

  async findAll(query: any = {}, user?: any) {
    const { page = 1, limit = 20, status, clientId, branchId, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter: any = {};

    if (user) {
      if (user.role === Role.CLIENT) {
        // Find all client profiles associated with this user's mobile number
        const clients = await this.clientModel.find({ mobile: user.mobile }).lean();
        if (clients.length > 0) {
          const clientIds = clients.map(c => c._id);
          filter.clientId = { $in: clientIds };
        } else {
          return { invoices: [], total: 0, page: Number(page), limit: Number(limit) };
        }
      } else if (user.role === Role.LAB || user.role === Role.LAB_EMP) {
        if (user.branchId && Types.ObjectId.isValid(user.branchId)) {
          filter.branchId = user.branchId;
        }
      }
    }

    if (branchId && Types.ObjectId.isValid(branchId)) {
      filter.branchId = branchId;
    }

    if (status) filter.status = status;
    if (clientId && Types.ObjectId.isValid(clientId)) filter.clientId = clientId;

    if (search) {
      const clientsWithSearch = await this.clientModel.find({ name: { $regex: search, $options: 'i' } }).select('_id').lean();
      const clientIds = clientsWithSearch.map(c => c._id);
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientId: { $in: clientIds } }
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [invoices, total] = await Promise.all([
      this.invoiceModel.find(filter)
        .populate('clientId', 'name email mobile')
        .populate('branchId', 'name')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort(sort)
        .lean(),
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
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException('Invoice not found');

    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = new Date();
    invoice.paidAmount = invoice.total;
    invoice.balance = 0;
    
    await invoice.save();
    return invoice;
  }

  async recordPayment(id: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than zero');
    
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException('Invoice not found');

    invoice.paidAmount = (invoice.paidAmount || 0) + amount;
    invoice.balance = invoice.total - invoice.paidAmount;

    if (invoice.balance <= 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
      invoice.balance = 0;
    } else {
      // If payment is recorded, status should at least be SENT if it was DRAFT
      if (invoice.status === InvoiceStatus.DRAFT) {
        invoice.status = InvoiceStatus.SENT;
      }
    }

    await invoice.save();
    return invoice;
  }
}
