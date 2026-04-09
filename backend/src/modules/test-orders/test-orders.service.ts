import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TestOrder, TestOrderDocument, TestOrderStatus } from './schemas/test-order.schema';
import { TestMaster, TestMasterDocument } from '../test-master/schemas/test-master.schema';
import { LabReport, LabReportDocument, ReportStatus } from '../lab-reports/schemas/lab-report.schema';
import { CounterService } from '../counter/counter.service';

@Injectable()
export class TestOrdersService {
  constructor(
    @InjectModel(TestOrder.name) private orderModel: Model<TestOrderDocument>,
    @InjectModel(TestMaster.name) private testModel: Model<TestMasterDocument>,
    @InjectModel(LabReport.name) private reportModel: Model<LabReportDocument>,
    private counterService: CounterService,
  ) {}

  async create(dto: any, userId: string) {
    const orderNumber = await this.counterService.generateNumber('ORD', 'test-order');

    // Calculate total from tests
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

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, clientId, branchId } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;
    if (branchId) filter.branchId = branchId;

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

  async findById(id: string) {
    const order = await this.orderModel.findById(id)
      .populate('clientId', 'name email mobile age gender')
      .populate('tests', 'name code price parameters sampleType')
      .populate('orderedBy', 'name')
      .populate('collectedBy', 'name')
      .lean();
    if (!order) throw new NotFoundException('Test order not found');
    return order;
  }

  async collectSample(id: string, userId: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Test order not found');
    if (order.status !== TestOrderStatus.ORDERED) {
      throw new BadRequestException('Sample can only be collected for orders in ORDERED status');
    }

    order.status = TestOrderStatus.COLLECTED;
    order.sampleCollectedAt = new Date();
    order.collectedBy = new Types.ObjectId(userId);
    await order.save();

    // Create lab reports for each test
    const tests = await this.testModel.find({ _id: { $in: order.tests } }).lean();
    for (const test of tests) {
      const reportNumber = await this.counterService.generateNumber('RPT', 'lab-report');
      await this.reportModel.create({
        reportNumber,
        testOrderId: order._id,
        clientId: order.clientId,
        testId: test._id,
        branchId: order.branchId,
        status: ReportStatus.PENDING,
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

  async updateStatus(id: string, status: TestOrderStatus) {
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new NotFoundException('Test order not found');
    return order;
  }
}
