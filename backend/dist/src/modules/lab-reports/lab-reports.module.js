"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabReportsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const lab_report_schema_1 = require("./schemas/lab-report.schema");
const test_order_schema_1 = require("../test-orders/schemas/test-order.schema");
const client_schema_1 = require("../clients/schemas/client.schema");
const lab_reports_service_1 = require("./lab-reports.service");
const lab_reports_controller_1 = require("./lab-reports.controller");
const pdf_module_1 = require("../pdf/pdf.module");
const auth_module_1 = require("../auth/auth.module");
let LabReportsModule = class LabReportsModule {
};
exports.LabReportsModule = LabReportsModule;
exports.LabReportsModule = LabReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: lab_report_schema_1.LabReport.name, schema: lab_report_schema_1.LabReportSchema },
                { name: test_order_schema_1.TestOrder.name, schema: test_order_schema_1.TestOrderSchema },
                { name: client_schema_1.Client.name, schema: client_schema_1.ClientSchema },
            ]),
            pdf_module_1.PdfModule,
            auth_module_1.AuthModule,
        ],
        controllers: [lab_reports_controller_1.LabReportsController],
        providers: [lab_reports_service_1.LabReportsService],
        exports: [lab_reports_service_1.LabReportsService, mongoose_1.MongooseModule],
    })
], LabReportsModule);
//# sourceMappingURL=lab-reports.module.js.map