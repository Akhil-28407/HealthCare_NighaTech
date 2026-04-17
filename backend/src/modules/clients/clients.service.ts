import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

  async create(dto: any, user?: any) {
    if (user && (user.role === 'LAB' || user.role === 'LAB_EMP')) {
      if (!user.branchId || !Types.ObjectId.isValid(user.branchId)) {
        throw new UnauthorizedException('No branch assigned to your account');
      }
      dto.branchId = user.branchId;
    }

    // Prevent duplicate name + mobile in the same branch
    const existing = await this.clientModel.findOne({
      branchId: dto.branchId,
      mobile: dto.mobile,
      name: { $regex: new RegExp(`^${dto.name}$`, 'i') }
    }).lean();

    if (existing) {
      throw new ConflictException('A patient with this name and mobile already exists in your branch');
    }

    return this.clientModel.create(dto);
  }

  async findAll(query: any = {}, user?: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { search, branchId } = query;
    const filter: any = {};

    // Role-based branch isolation
    if (user && (user.role === 'LAB' || user.role === 'LAB_EMP')) {
      if (user.branchId && Types.ObjectId.isValid(user.branchId)) {
        filter.branchId = user.branchId;
      }
    } else if (branchId && Types.ObjectId.isValid(branchId)) {
      filter.branchId = branchId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.clientModel.find(filter).populate('branchId', 'name').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
      this.clientModel.countDocuments(filter),
    ]);
    return { clients, total, page, limit };
  }

  async findById(id: string, user?: any) {
    const client = await this.clientModel.findById(id).populate('branchId', 'name').lean();
    if (!client) throw new NotFoundException('Client not found');

    if (user && (user.role === 'LAB' || user.role === 'LAB_EMP')) {
      if (!user.branchId || client.branchId?._id?.toString() !== user.branchId?.toString()) {
        throw new NotFoundException('Client not found');
      }
    }

    return client;
  }

  async update(id: string, dto: any, user?: any) {
    if (user && (user.role === 'LAB' || user.role === 'LAB_EMP')) {
      // Prevent branch reassignment by lab users.
      delete dto.branchId;

      const existing = await this.clientModel.findById(id).lean();
      if (!existing) throw new NotFoundException('Client not found');
      if (!user.branchId || existing.branchId?.toString() !== user.branchId?.toString()) {
        throw new NotFoundException('Client not found');
      }
    }

    const client = await this.clientModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async delete(id: string, user?: any) {
    const client = await this.clientModel.findById(id).lean();
    if (!client) throw new NotFoundException('Client not found');

    // Role-based branch security
    if (user && (user.role === 'LAB' || user.role === 'LAB_EMP')) {
      if (!user.branchId || client.branchId?.toString() !== user.branchId?.toString()) {
        throw new UnauthorizedException('You do not have permission to delete this client');
      }
    }

    await this.clientModel.findByIdAndDelete(id);
    return { success: true, message: 'Client deleted successfully' };
  }

  async searchByMobile(mobile: string) {
    if (!mobile) return { clients: [] };
    
    // We search for clients with exactly this mobile number
    const clients = await this.clientModel.find({ 
      mobile: mobile,
      isActive: true 
    })
    .select('name email mobile age gender address')
    .lean();

    return { clients };
  }
}
