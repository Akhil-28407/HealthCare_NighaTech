"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const quotation_schema_1 = require("./schemas/quotation.schema");
const invoice_schema_1 = require("../invoices/schemas/invoice.schema");
const client_schema_1 = require("../clients/schemas/client.schema");
const quotations_service_1 = require("./quotations.service");
const quotations_controller_1 = require("./quotations.controller");
const counter_module_1 = require("../counter/counter.module");
const mail_module_1 = require("../mail/mail.module");
const pdf_module_1 = require("../pdf/pdf.module");
const auth_module_1 = require("../auth/auth.module");
let QuotationsModule = class QuotationsModule {
};
exports.QuotationsModule = QuotationsModule;
exports.QuotationsModule = QuotationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: quotation_schema_1.Quotation.name, schema: quotation_schema_1.QuotationSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
            ]),
            counter_module_1.CounterModule,
            mail_module_1.MailModule,
            pdf_module_1.PdfModule,
            auth_module_1.AuthModule,
        ],
        controllers: [quotations_controller_1.QuotationsController],
        providers: [quotations_service_1.QuotationsService],
        exports: [quotations_service_1.QuotationsService],
    })
], QuotationsModule);
//# sourceMappingURL=quotations.module.js.map