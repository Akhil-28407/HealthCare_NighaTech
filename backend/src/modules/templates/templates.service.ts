import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Handlebars from 'handlebars';
import { ReportTemplate, ReportTemplateDocument } from './schemas/report-template.schema';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(ReportTemplate.name) private templateModel: Model<ReportTemplateDocument>,
  ) {}

  async create(dto: any, user?: any) {
    const data = { ...dto };
    if (user?.role === 'LAB' && user.branchId) {
      data.branchId = user.branchId;
    }
    return this.templateModel.create(data);
  }

  async findAll(query: any = {}, user?: any) {
    const { type } = query;
    const filter: any = { isActive: true };
    if (type) filter.type = type;

    if (user?.role === 'LAB') {
      filter.$or = [
        { branchId: user.branchId },
        { branchId: null },
      ];
    } else if (user?.role === 'LAB_EMP') {
      filter.$or = [
        { branchId: user.branchId },
        { branchId: null },
      ];
    }

    return this.templateModel.find(filter).sort({ isDefault: -1, createdAt: -1 }).lean();
  }

  async findById(id: string) {
    const template = await this.templateModel.findById(id).lean();
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: any) {
    const template = await this.templateModel.findById(id);
    if (!template) throw new NotFoundException('Template not found');

    Object.assign(template, dto);
    return template.save();
  }

  async delete(id: string) {
    const template = await this.templateModel.findById(id);
    if (!template) throw new NotFoundException('Template not found');

    template.isActive = false;
    await template.save();
    return { success: true, message: 'Template deactivated' };
  }

  async preview(id: string, data: any) {
    const template = await this.findById(id);
    if (!template) throw new NotFoundException('Template not found');

    Handlebars.registerHelper('eq', (a, b) => a === b);
    const compiled = Handlebars.compile(template.content);
    const sampleData = data || {
      patient: { name: 'John Doe', age: 35, gender: 'Male', mobile: '9876543210' },
      branch: { labName: 'Sample Lab', address: '123 Main St', phone: '1234567890', email: 'lab@example.com' },
      reportNumber: 'RPT-2024-0001',
      orderNumber: 'ORD-2024-0001',
      testName: 'Complete Blood Count',
      results: [
        { name: 'Hemoglobin', value: '14.5', unit: 'g/dL', normalRangeMin: 13, normalRangeMax: 17, flag: 'N' },
        { name: 'WBC Count', value: '12000', unit: '/cumm', normalRangeMin: 4000, normalRangeMax: 11000, flag: 'H' },
      ],
      invoice: { total: 1500 },
      reportDate: new Date().toLocaleDateString(),
      generatedAt: new Date().toLocaleString(),
    };

    return { html: compiled(sampleData) };
  }
}
