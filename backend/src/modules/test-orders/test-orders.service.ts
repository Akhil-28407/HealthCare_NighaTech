import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TestOrder, TestOrderDocument, TestOrderStatus } from './schemas/test-order.schema';
import { TestMaster, TestMasterDocument } from '../test-master/schemas/test-master.schema';
import { LabReport, LabReportDocument, ReportStatus } from '../lab-reports/schemas/lab-report.schema';
import { CounterService } from '../counter/counter.service';
import { InvoicesService } from '../invoices/invoices.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class TestOrdersService {
  constructor(
    @InjectModel(TestOrder.name) private orderModel: Model<TestOrderDocument>,
    @InjectModel(TestMaster.name) private testModel: Model<TestMasterDocument>,
    @InjectModel(LabReport.name) private reportModel: Model<LabReportDocument>,
    private counterService: CounterService,
    private invoicesService: InvoicesService,
  ) {}

  async create(dto: any, user: any) {
    if (!dto.clientId || !Types.ObjectId.isValid(dto.clientId)) {
      throw new BadRequestException('Valid clientId is required');
    }
    dto.clientId = new Types.ObjectId(dto.clientId);

    if (!Array.isArray(dto.tests) || dto.tests.length === 0) {
      throw new BadRequestException('At least one test is required');
    }

    const validTestIds = dto.tests
      .filter((id: string) => Types.ObjectId.isValid(id))
      .map((id: string) => new Types.ObjectId(id));
      
    if (validTestIds.length !== dto.tests.length) {
      throw new BadRequestException('One or more test IDs are invalid');
    }

    dto.tests = validTestIds;

    // Fetch client details for auto-population
    const client = await this.orderModel.db.collection('clients').findOne({ _id: dto.clientId });
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    const orderNumber = await this.counterService.generateNumber('ORD', 'test-order');

    // Calculate total from tests
    const testsData = await this.testModel.find({ _id: { $in: dto.tests } }).lean();
    const totalAmount = testsData.reduce((sum, t) => sum + (t.price || 0), 0);
    const discount = dto.discount || 0;
    const netAmount = totalAmount - discount;

    const data: any = {
      ...dto,
      orderNumber,
      orderedBy: user.sub,
      totalAmount,
      discount,
      netAmount,
      status: dto.autoCollect ? TestOrderStatus.COLLECTED : TestOrderStatus.ORDERED,
      sampleCollectedAt: dto.autoCollect ? new Date() : undefined,
      collectedBy: dto.autoCollect ? new Types.ObjectId(user.sub) : undefined,
      // Auto-populate contact person details from Client if not provided
      contactPersonName: dto.contactPersonName || client.name,
      email: dto.email || client.email,
      phone: dto.phone || client.mobile,
    };

    if (user.role === 'LAB' || user.role === 'LAB_EMP') {
      if (!user.branchId || !Types.ObjectId.isValid(user.branchId)) {
        throw new BadRequestException('Your lab profile must be approved before creating test orders');
      }
      data.branchId = user.branchId;
    }

    const order = await this.orderModel.create(data);

    // Create lab reports for each test if autoCollect is true
    if (dto.autoCollect) {
      for (const test of testsData) {
        const reportNumber = await this.counterService.generateNumber('RPT', 'lab-report');
        await this.reportModel.create({
          reportNumber,
          testOrderId: order._id,
          clientId: order.clientId,
          testId: test._id,
          branchId: order.branchId && Types.ObjectId.isValid(order.branchId) ? order.branchId : undefined,
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
    }

    // Link to existing quotation invoice OR create a new one
    try {
      let existingInvoice = null;
      if (order.quotationNumber) {
        // Look for an invoice created from this quotation
        existingInvoice = await this.orderModel.db.collection('invoices').findOne({ 
          quotationNumber: order.quotationNumber,
          testOrderId: { $exists: false } // Only take it if not already linked
        });
      }

      if (existingInvoice) {
        // Link the existing paid/unpaid invoice to this order
        await this.orderModel.db.collection('invoices').updateOne(
          { _id: existingInvoice._id },
          { $set: { testOrderId: order._id } }
        );
      } else {
        // Only create a new one if no quotation invoice exists
        await this.invoicesService.create({
          clientId: order.clientId,
          testOrderId: order._id,
          branchId: order.branchId,
          items: testsData.map(test => ({
            name: test.name,
            quantity: 1,
            unitPrice: test.price || 0,
            description: test.category || 'Clinical Test'
          })),
          discount: order.discount || 0,
          notes: `Invoice generated for Order ${order.orderNumber}`
        });
      }
    } catch (invError) {
      console.error(`[TestOrders] Failed to auto-create invoice for order ${order.orderNumber}:`, invError.message);
      // We don't throw here to avoid failing the order creation itself
    }

    return order;
  }

  async findAll(query: any = {}, user?: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { status, clientId, branchId, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter: any = {};
    
    // Role-based branch isolation
    if (user && (user.role === Role.LAB || user.role === Role.LAB_EMP)) {
      if (!user.branchId || !Types.ObjectId.isValid(user.branchId)) {
        return { orders: [], total: 0, page, limit, error: 'Branch not approved' };
      }
      filter.branchId = user.branchId;
    } else if (branchId && Types.ObjectId.isValid(branchId)) {
      filter.branchId = branchId;
    }

    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { contactPersonName: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter)
        .populate('clientId', 'name email mobile')
        .populate('tests', 'name code price')
        .populate('orderedBy', 'name')
        .populate('collectedBy', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page, limit };
  }

  async findById(id: string, user?: any) {
    const order = await this.orderModel.findById(id)
      .populate('clientId', 'name email mobile age gender')
      .populate('tests', 'name code price parameters sampleType')
      .populate('orderedBy', 'name')
      .populate('collectedBy', 'name')
      .lean();
    if (!order) throw new NotFoundException('Test order not found');
    return order;
  }

  async collectSample(id: string, user: any) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Test order not found');
    if (order.status !== TestOrderStatus.ORDERED) {
      throw new BadRequestException('Sample can only be collected for orders in ORDERED status');
    }

    order.status = TestOrderStatus.COLLECTED;
    order.sampleCollectedAt = new Date();
    order.collectedBy = new Types.ObjectId(user.sub);
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
        branchId: order.branchId && Types.ObjectId.isValid(order.branchId) ? order.branchId : undefined,
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

  async updateStatus(id: string, status: TestOrderStatus, user: any) {
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new NotFoundException('Test order not found');
    return order;
  }
}
