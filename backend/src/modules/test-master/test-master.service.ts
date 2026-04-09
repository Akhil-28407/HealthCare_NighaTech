import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestMaster, TestMasterDocument } from './schemas/test-master.schema';

@Injectable()
export class TestMasterService {
  constructor(@InjectModel(TestMaster.name) private testModel: Model<TestMasterDocument>) {}

  async create(dto: any) { return this.testModel.create(dto); }

  async findAll(query: any = {}) {
    const { page = 1, limit = 50, search, category } = query;
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    const [tests, total] = await Promise.all([
      this.testModel.find(filter).skip((page - 1) * limit).limit(limit).sort({ name: 1 }).lean(),
      this.testModel.countDocuments(filter),
    ]);
    return { tests, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const test = await this.testModel.findById(id).lean();
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async update(id: string, dto: any) {
    const test = await this.testModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async delete(id: string) {
    const test = await this.testModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!test) throw new NotFoundException('Test not found');
    return { success: true, message: 'Test deactivated' };
  }
}
