import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  constructor(@InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>) {}

  async log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const diff = this.calculateDiff(data.oldData, data.newData);
    return this.auditModel.create({
      userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId ? new Types.ObjectId(data.entityId) : undefined,
      oldData: data.oldData,
      newData: data.newData,
      diff,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 50, entity, action, userId } = query;
    const filter: any = {};
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    const [logs, total] = await Promise.all([
      this.auditModel.find(filter)
        .populate('userId', 'name email')
        .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
      this.auditModel.countDocuments(filter),
    ]);
    return { logs, total, page: Number(page), limit: Number(limit) };
  }

  private calculateDiff(oldData: any, newData: any): Record<string, any> {
    if (!oldData || !newData) return {};
    const diff: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    for (const key of allKeys) {
      if (key === '_id' || key === '__v' || key === 'updatedAt' || key === 'createdAt') continue;
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        diff[key] = { old: oldData[key], new: newData[key] };
      }
    }
    return diff;
  }
}
