import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument } from './schemas/branch.schema';

@Injectable()
export class BranchesService {
  constructor(@InjectModel(Branch.name) private branchModel: Model<BranchDocument>) {}

  async create(dto: any) {
    return this.branchModel.create(dto);
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, search } = query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [branches, total] = await Promise.all([
      this.branchModel.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
      this.branchModel.countDocuments(filter),
    ]);
    return { branches, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const branch = await this.branchModel.findById(id).lean();
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, dto: any) {
    const branch = await this.branchModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async delete(id: string) {
    const branch = await this.branchModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!branch) throw new NotFoundException('Branch not found');
    return { success: true, message: 'Branch deactivated' };
  }
}
