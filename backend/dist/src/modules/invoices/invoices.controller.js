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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("./invoices.service");
const pdf_service_1 = require("../pdf/pdf.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let InvoicesController = class InvoicesController {
    constructor(service, pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }
    create(dto) { return this.service.create(dto); }
    findAll(query) { return this.service.findAll(query); }
    findById(id) { return this.service.findById(id); }
    async downloadPdf(id, res) {
        const invoice = await this.service.findById(id);
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice, 'INVOICE');
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
        });
        res.end(pdfBuffer);
    }
    send(id) { return this.service.send(id); }
    markPaid(id) { return this.service.markPaid(id); }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.ADMIN, role_enum_1.Role.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Create invoice' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invoices' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Download invoice as PDF' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.ADMIN, role_enum_1.Role.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Send invoice via email' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(':id/mark-paid'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mark invoice as paid' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "markPaid", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Invoices'),
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        pdf_service_1.PdfService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map