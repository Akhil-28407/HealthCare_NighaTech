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
exports.LabReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const QRCode = require("qrcode");
const lab_report_schema_1 = require("./schemas/lab-report.schema");
const test_order_schema_1 = require("../test-orders/schemas/test-order.schema");
const client_schema_1 = require("../clients/schemas/client.schema");
const role_enum_1 = require("../../common/enums/role.enum");
let LabReportsService = class LabReportsService {
    constructor(reportModel, orderModel, clientModel, configService) {
        this.reportModel = reportModel;
        this.orderModel = orderModel;
        this.clientModel = clientModel;
        this.configService = configService;
    }
    async findAll(query = {}, user) {
        const { page = 1, limit = 20, status, clientId, testOrderId } = query;
        const filter = {};
        if (user.role === role_enum_1.Role.CLIENT) {
            const client = await this.clientModel.findOne({ userId: user.sub }).lean();
            if (client) {
                filter.clientId = client._id;
                if (!status) {
                    filter.status = lab_report_schema_1.ReportStatus.VERIFIED;
                }
            }
            else {
                return { reports: [], total: 0, page: Number(page), limit: Number(limit) };
            }
        }
        else if (clientId) {
            filter.clientId = clientId;
        }
        if (status)
            filter.status = status;
        if (testOrderId)
            filter.testOrderId = testOrderId;
        const [reports, total] = await Promise.all([
            this.reportModel.find(filter)
                .populate('clientId', 'name email mobile age gender')
                .populate('testId', 'name code category')
                .populate('testOrderId', 'orderNumber')
                .populate('enteredBy', 'name')
                .populate('verifiedBy', 'name')
                .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
            this.reportModel.countDocuments(filter),
        ]);
        return { reports, total, page: Number(page), limit: Number(limit) };
    }
    async findById(id) {
        const report = await this.reportModel.findById(id)
            .populate('clientId', 'name email mobile age gender address')
            .populate('testId', 'name code category sampleType parameters')
            .populate('testOrderId', 'orderNumber sampleCollectedAt')
            .populate('branchId', 'name address phone email labName labLicense')
            .populate('enteredBy', 'name')
            .populate('verifiedBy', 'name')
            .lean();
        if (!report)
            throw new common_1.NotFoundException('Lab report not found');
        return report;
    }
    async updateResults(id, results, userId) {
        const report = await this.reportModel.findById(id);
        if (!report)
            throw new common_1.NotFoundException('Lab report not found');
        if (report.status === lab_report_schema_1.ReportStatus.VERIFIED) {
            throw new common_1.BadRequestException('Cannot modify a verified report');
        }
        const flaggedResults = results.map(r => {
            let flag = 'N';
            const numValue = parseFloat(r.value);
            if (!isNaN(numValue)) {
                if (r.normalRangeMin != null && numValue < r.normalRangeMin)
                    flag = 'L';
                else if (r.normalRangeMax != null && numValue > r.normalRangeMax)
                    flag = 'H';
            }
            return { ...r, flag };
        });
        report.results = flaggedResults;
        report.status = lab_report_schema_1.ReportStatus.RESULTS_ENTERED;
        report.enteredBy = new mongoose_2.Types.ObjectId(userId);
        await report.save();
        return report;
    }
    async verifyReport(id, userId) {
        const report = await this.reportModel.findById(id);
        if (!report)
            throw new common_1.NotFoundException('Lab report not found');
        if (report.status !== lab_report_schema_1.ReportStatus.RESULTS_ENTERED) {
            throw new common_1.BadRequestException('Report must have results entered before verification');
        }
        const reportUrl = `${this.configService.get('app.frontendUrl')}/reports/${id}`;
        const qrCode = await QRCode.toDataURL(reportUrl);
        report.status = lab_report_schema_1.ReportStatus.VERIFIED;
        report.verifiedBy = new mongoose_2.Types.ObjectId(userId);
        report.verifiedAt = new Date();
        report.qrCode = qrCode;
        await report.save();
        const allReports = await this.reportModel.find({ testOrderId: report.testOrderId });
        const allVerified = allReports.every(r => r.status === lab_report_schema_1.ReportStatus.VERIFIED);
        if (allVerified) {
            await this.orderModel.findByIdAndUpdate(report.testOrderId, {
                status: test_order_schema_1.TestOrderStatus.COMPLETED,
            });
        }
        return report;
    }
};
exports.LabReportsService = LabReportsService;
exports.LabReportsService = LabReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(lab_report_schema_1.LabReport.name)),
    __param(1, (0, mongoose_1.InjectModel)(test_order_schema_1.TestOrder.name)),
    __param(2, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService])
], LabReportsService);
//# sourceMappingURL=lab-reports.service.js.map