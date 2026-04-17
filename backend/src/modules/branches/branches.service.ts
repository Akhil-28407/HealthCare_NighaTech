import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument, BranchStatus } from './schemas/branch.schema';
import { BranchUpdateRequest, BranchUpdateRequestDocument, BranchUpdateRequestStatus } from './schemas/branch-update.schema';
import { Role } from '../../common/enums/role.enum';
import { Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BranchUpdateRequest.name) private requestModel: Model<BranchUpdateRequestDocument>,
  ) {}

  async create(dto: any, user?: any) {
    const data = { ...dto };
    if (user) {
      if (user.role === Role.LAB) {
        const existingRequest = await this.branchModel.findOne({
          $or: [
            { requestedBy: new Types.ObjectId(user.sub) },
            ...(user.branchId && Types.ObjectId.isValid(user.branchId)
              ? [{ _id: new Types.ObjectId(user.branchId) }]
              : []),
          ],
        }).lean();

        if (existingRequest) {
          throw new ConflictException('You have already registered a lab profile');
        }

        data.status = BranchStatus.PENDING;
        data.requestedBy = new Types.ObjectId(user.sub);
      } else if ([Role.ADMIN, Role.SUPER_ADMIN].includes(user.role)) {
        data.status = BranchStatus.APPROVED;
      }
    }
    return this.branchModel.create(data);
  }

  async findAll(query: any = {}, user?: any) {
    const { page = 1, limit = 20, search, status } = query;
    const filter: any = {};

    if (user?.role === Role.LAB) {
      filter.$or = [
        { requestedBy: new Types.ObjectId(user.sub) },
        ...(user.branchId && Types.ObjectId.isValid(user.branchId)
          ? [{ _id: new Types.ObjectId(user.branchId) }]
          : []),
      ];
    }

    if (search) {
      const searchFilter = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchFilter }];
        delete filter.$or;
      } else {
        filter.$or = searchFilter;
      }
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

  async findById(id: string, user?: any) {
    const branch = await this.branchModel.findById(id).lean();
    if (!branch) throw new NotFoundException('Branch not found');

    if (user?.role === Role.LAB) {
      const isRequestedByUser = branch.requestedBy?.toString() === user.sub;
      const isAssignedBranch = user.branchId?.toString() === id;
      if (!isRequestedByUser && !isAssignedBranch) {
        throw new NotFoundException('Branch not found');
      }
    }

    return branch;
  }

  async updateStatus(id: string, status: BranchStatus) {
    const branch = await this.branchModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!branch) throw new NotFoundException('Branch not found');

    if (branch.requestedBy) {
      if (status === BranchStatus.APPROVED) {
        await this.userModel.updateOne(
          { _id: branch.requestedBy },
          { $set: { isActive: true, branchId: branch._id } },
        );
      } else if (status === BranchStatus.REJECTED) {
        await this.userModel.updateOne(
          { _id: branch.requestedBy },
          { $set: { isActive: false, branchId: null } },
        );
      }
    }

    return branch;
  }

  async update(id: string, dto: any, user?: any) {
    const branch = await this.branchModel.findById(id).lean();
    if (!branch) throw new NotFoundException('Branch not found');

    // Only allow Lab users to update their own branch
    if (user && user.role === Role.LAB && user.branchId?.toString() !== id) {
      throw new NotFoundException('You can only update your own branch profile');
    }

    // If Admin/Superadmin, update directly
    if (user && [Role.ADMIN, Role.SUPER_ADMIN].includes(user.role)) {
      return this.branchModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    }

    // If LAB, create a change request instead of updating
    const request = await this.requestModel.create({
      branchId: new Types.ObjectId(id),
      requestedBy: new Types.ObjectId(user.sub),
      oldData: branch,
      newData: dto,
      status: BranchUpdateRequestStatus.PENDING,
    });

    return { 
      message: 'Your profile update request has been submitted for admin approval',
      requestId: request._id 
    };
  }

  async findAllUpdateRequests(query: any = {}) {
    const { status = BranchUpdateRequestStatus.PENDING, page = 1, limit = 20 } = query;
    const filter = { status };

    const [requests, total] = await Promise.all([
      this.requestModel.find(filter)
        .populate('branchId', 'name labName')
        .populate('requestedBy', 'name email')
        .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
      this.requestModel.countDocuments(filter),
    ]);

    return { requests, total, page: Number(page), limit: Number(limit) };
  }

  async processUpdateRequest(id: string, status: BranchUpdateRequestStatus, processorId: string, rejectionReason?: string) {
    const request = await this.requestModel.findById(id);
    if (!request) throw new NotFoundException('Update request not found');
    if (request.status !== BranchUpdateRequestStatus.PENDING) {
      throw new ConflictException('Request has already been processed');
    }

    request.status = status;
    request.processedBy = new Types.ObjectId(processorId);
    
    if (status === BranchUpdateRequestStatus.APPROVED) {
      // Apply the changes to the branch
      await this.branchModel.findByIdAndUpdate(request.branchId, request.newData);
    } else if (status === BranchUpdateRequestStatus.REJECTED) {
      request.rejectionReason = rejectionReason;
    }

    await request.save();
    return request;
  }

  async delete(id: string) {
    const branch = await this.branchModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!branch) throw new NotFoundException('Branch not found');
    return { success: true, message: 'Branch deactivated' };
  }
}
