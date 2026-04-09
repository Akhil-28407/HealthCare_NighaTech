import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

  async create(dto: any) {
    return this.clientModel.create(dto);
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, search, branchId } = query;
    const filter: any = {};
    if (branchId) filter.branchId = branchId;
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
    return { clients, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const client = await this.clientModel.findById(id).populate('branchId', 'name').lean();
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, dto: any) {
    const client = await this.clientModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async delete(id: string) {
    const client = await this.clientModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!client) throw new NotFoundException('Client not found');
    return { success: true, message: 'Client deactivated' };
  }
}
