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
exports.TestOrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const test_order_schema_1 = require("./schemas/test-order.schema");
const test_master_schema_1 = require("../test-master/schemas/test-master.schema");
const lab_report_schema_1 = require("../lab-reports/schemas/lab-report.schema");
const counter_service_1 = require("../counter/counter.service");
let TestOrdersService = class TestOrdersService {
    constructor(orderModel, testModel, reportModel, counterService) {
        this.orderModel = orderModel;
        this.testModel = testModel;
        this.reportModel = reportModel;
        this.counterService = counterService;
    }
    async create(dto, userId) {
        const orderNumber = await this.counterService.generateNumber('ORD', 'test-order');
        const tests = await this.testModel.find({ _id: { $in: dto.tests } }).lean();
        const totalAmount = tests.reduce((sum, t) => sum + (t.price || 0), 0);
        const discount = dto.discount || 0;
        const netAmount = totalAmount - discount;
        const order = await this.orderModel.create({
            ...dto,
            orderNumber,
            orderedBy: userId,
            totalAmount,
            discount,
            netAmount,
        });
        return order;
    }
    async findAll(query = {}) {
        const { page = 1, limit = 20, status, clientId, branchId } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (clientId)
            filter.clientId = clientId;
        if (branchId)
            filter.branchId = branchId;
        const [orders, total] = await Promise.all([
            this.orderModel.find(filter)
                .populate('clientId', 'name email mobile')
                .populate('tests', 'name code price')
                .populate('orderedBy', 'name')
                .populate('collectedBy', 'name')
                .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
            this.orderModel.countDocuments(filter),
        ]);
        return { orders, total, page: Number(page), limit: Number(limit) };
    }
    async findById(id) {
        const order = await this.orderModel.findById(id)
            .populate('clientId', 'name email mobile age gender')
            .populate('tests', 'name code price parameters sampleType')
            .populate('orderedBy', 'name')
            .populate('collectedBy', 'name')
            .lean();
        if (!order)
            throw new common_1.NotFoundException('Test order not found');
        return order;
    }
    async collectSample(id, userId) {
        const order = await this.orderModel.findById(id);
        if (!order)
            throw new common_1.NotFoundException('Test order not found');
        if (order.status !== test_order_schema_1.TestOrderStatus.ORDERED) {
            throw new common_1.BadRequestException('Sample can only be collected for orders in ORDERED status');
        }
        order.status = test_order_schema_1.TestOrderStatus.COLLECTED;
        order.sampleCollectedAt = new Date();
        order.collectedBy = new mongoose_2.Types.ObjectId(userId);
        await order.save();
        const tests = await this.testModel.find({ _id: { $in: order.tests } }).lean();
        for (const test of tests) {
            const reportNumber = await this.counterService.generateNumber('RPT', 'lab-report');
            await this.reportModel.create({
                reportNumber,
                testOrderId: order._id,
                clientId: order.clientId,
                testId: test._id,
                branchId: order.branchId,
                status: lab_report_schema_1.ReportStatus.PENDING,
                results: test.parameters.map(p => ({
                    name: p.name,
                    unit: p.unit,
                    normalRangeMin: p.normalRangeMin,
                    normalRangeMax: p.normalRangeMax,
                    normalRangeText: p.normalRangeText,
                    method: p.method,
                    value: '',
                    flag: '',
                })),
            });
        }
        return order;
    }
    async updateStatus(id, status) {
        const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!order)
            throw new common_1.NotFoundException('Test order not found');
        return order;
    }
};
exports.TestOrdersService = TestOrdersService;
exports.TestOrdersService = TestOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(test_order_schema_1.TestOrder.name)),
    __param(1, (0, mongoose_1.InjectModel)(test_master_schema_1.TestMaster.name)),
    __param(2, (0, mongoose_1.InjectModel)(lab_report_schema_1.LabReport.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        counter_service_1.CounterService])
], TestOrdersService);
//# sourceMappingURL=test-orders.service.js.map