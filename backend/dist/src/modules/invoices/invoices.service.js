"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const invoice_schema_1 = require("./schemas/invoice.schema");
const client_schema_1 = require("../clients/schemas/client.schema");
const counter_service_1 = require("../counter/counter.service");
const mail_service_1 = require("../mail/mail.service");
let InvoicesService = class InvoicesService {
    constructor(invoiceModel, clientModel, counterService, mailService, configService) {
        this.invoiceModel = invoiceModel;
        this.clientModel = clientModel;
        this.counterService = counterService;
        this.mailService = mailService;
        this.configService = configService;
    }
    async create(dto) {
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
    async findAll(query = {}) {
        const { page = 1, limit = 20, status, clientId } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (clientId)
            filter.clientId = clientId;
        const [invoices, total] = await Promise.all([
            this.invoiceModel.find(filter)
                .populate('clientId', 'name email mobile')
                .populate('branchId', 'name')
                .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
            this.invoiceModel.countDocuments(filter),
        ]);
        return { invoices, total, page: Number(page), limit: Number(limit) };
    }
    async findById(id) {
        const invoice = await this.invoiceModel.findById(id)
            .populate('clientId', 'name email mobile address')
            .populate('branchId', 'name address phone email labName labLicense')
            .lean();
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async send(id) {
        const invoice = await this.invoiceModel.findById(id).populate('clientId', 'name email');
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        const client = invoice.clientId;
        if (client?.email) {
            const viewUrl = `${this.configService.get('app.frontendUrl')}/invoices/${id}`;
            await this.mailService.sendInvoice(client.email, client.name, invoice.invoiceNumber, viewUrl);
        }
        invoice.status = invoice_schema_1.InvoiceStatus.SENT;
        invoice.sentAt = new Date();
        await invoice.save();
        return { success: true, message: 'Invoice sent' };
    }
    async markPaid(id) {
        const invoice = await this.invoiceModel.findByIdAndUpdate(id, { status: invoice_schema_1.InvoiceStatus.PAID, paidAt: new Date() }, { new: true });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        counter_service_1.CounterService,
        mail_service_1.MailService,
        config_1.ConfigService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map