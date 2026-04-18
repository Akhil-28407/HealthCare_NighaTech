import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TestMaster, TestMasterDocument } from './schemas/test-master.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class TestMasterService {
  constructor(@InjectModel(TestMaster.name) private testModel: Model<TestMasterDocument>) {}

  async create(dto: any, user?: any) {
    if (user?.role === 'LAB' || user?.role === 'LAB_EMP') {
      if (!user.branchId || !Types.ObjectId.isValid(user.branchId)) {
        throw new UnauthorizedException('No branch assigned to your account');
      }
      dto.branchId = user.branchId;
    }

    return this.testModel.create(dto);
  }

  async findAll(query: any = {}, user?: any) {
    const { page = 1, limit = 50, search, category, branchId, sortBy = 'name', sortOrder = 'asc' } = query;
    const filter: any = { isActive: true };

    if (user?.role === Role.LAB || user?.role === Role.LAB_EMP) {
      if (user.branchId && Types.ObjectId.isValid(user.branchId)) {
        filter.branchId = user.branchId;
      }
    } else if (branchId && Types.ObjectId.isValid(branchId)) {
      filter.branchId = branchId;
    }

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [tests, total] = await Promise.all([
      this.testModel.find(filter)
        .populate('branchId', 'name labName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort)
        .lean(),
      this.testModel.countDocuments(filter),
    ]);
    return { tests, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const test = await this.testModel.findById(id).lean();
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async update(id: string, dto: any, user?: any) {
    if (user?.role === 'LAB' || user?.role === 'LAB_EMP') {
      delete dto.branchId;
      const existing = await this.testModel.findById(id).lean();
      if (!existing) throw new NotFoundException('Test not found');
      if (!user.branchId || existing.branchId?.toString() !== user.branchId?.toString()) {
        throw new NotFoundException('Test not found');
      }
    }

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
