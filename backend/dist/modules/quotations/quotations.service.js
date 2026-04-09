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
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const quotation_schema_1 = require("./schemas/quotation.schema");
const invoice_schema_1 = require("../invoices/schemas/invoice.schema");
const client_schema_1 = require("../clients/schemas/client.schema");
const counter_service_1 = require("../counter/counter.service");
const mail_service_1 = require("../mail/mail.service");
let QuotationsService = class QuotationsService {
    constructor(quotationModel, invoiceModel, clientModel, counterService, mailService, configService) {
        this.quotationModel = quotationModel;
        this.invoiceModel = invoiceModel;
        this.clientModel = clientModel;
        this.counterService = counterService;
        this.mailService = mailService;
        this.configService = configService;
    }
    async create(dto) {
        const quotationNumber = await this.counterService.generateNumber('QUO', 'quotation');
        const items = (dto.items || []).map(item => ({
            ...item,
            amount: (item.quantity || 1) * item.unitPrice,
        }));
        const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
        const total = subtotal + (dto.tax || 0) - (dto.discount || 0);
        return this.quotationModel.create({ ...dto, quotationNumber, items, subtotal, total });
    }
    async findAll(query = {}) {
        const { page = 1, limit = 20, status, clientId } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (clientId)
            filter.clientId = clientId;
        const [quotations, total] = await Promise.all([
            this.quotationModel.find(filter)
                .populate('clientId', 'name email mobile')
                .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
            this.quotationModel.countDocuments(filter),
        ]);
        return { quotations, total, page: Number(page), limit: Number(limit) };
    }
    async findById(id) {
        const quotation = await this.quotationModel.findById(id)
            .populate('clientId', 'name email mobile address')
            .populate('branchId', 'name address phone email labName labLicense')
            .lean();
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        return quotation;
    }
    async send(id) {
        const quotation = await this.quotationModel.findById(id).populate('clientId', 'name email');
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        const client = quotation.clientId;
        if (client?.email) {
            const viewUrl = `${this.configService.get('app.frontendUrl')}/quotations/${id}`;
            await this.mailService.sendQuotation(client.email, client.name, quotation.quotationNumber, viewUrl);
        }
        quotation.status = quotation_schema_1.QuotationStatus.SENT;
        quotation.sentAt = new Date();
        await quotation.save();
        return { success: true, message: 'Quotation sent' };
    }
    async convertToInvoice(id) {
        const quotation = await this.quotationModel.findById(id);
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        if (quotation.status === quotation_schema_1.QuotationStatus.CONVERTED) {
            throw new common_1.NotFoundException('Quotation already converted');
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
        quotation.status = quotation_schema_1.QuotationStatus.CONVERTED;
        await quotation.save();
        return invoice;
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(quotation_schema_1.Quotation.name)),
    __param(1, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(2, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        counter_service_1.CounterService,
        mail_service_1.MailService,
        config_1.ConfigService])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map