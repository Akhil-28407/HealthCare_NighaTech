import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument, BranchStatus } from './schemas/branch.schema';
import { Role } from '../../common/enums/role.enum';
import { Types } from 'mongoose';

@Injectable()
export class BranchesService {
  constructor(@InjectModel(Branch.name) private branchModel: Model<BranchDocument>) {}

  async create(dto: any, user?: any) {
    const data = { ...dto };
    if (user) {
      if (user.role === Role.LAB || user.role === Role.LAB_EMP) {
        data.status = BranchStatus.PENDING;
        data.requestedBy = new Types.ObjectId(user.sub);
      } else if ([Role.ADMIN, Role.SUPER_ADMIN].includes(user.role)) {
        data.status = BranchStatus.APPROVED;
      }
    }
    return this.branchModel.create(data);
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, search, status } = query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;

    const [branches, total] = await Promise.all([
      this.branchModel.find(filter)
        .populate('requestedBy', 'name')
        .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
      this.branchModel.countDocuments(filter),
    ]);
    return { branches, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const branch = await this.branchModel.findById(id).lean();
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async updateStatus(id: string, status: BranchStatus) {
    const branch = await this.branchModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, dto: any, user?: any) {
    if (user && user.role === Role.LAB && user.branchId?.toString() !== id) {
      throw new NotFoundException('You can only update your own branch profile');
    }
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
