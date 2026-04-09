import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
export declare class AuditLogService {
    private auditModel;
    constructor(auditModel: Model<AuditLogDocument>);
    log(data: {
        userId?: string;
        action: string;
        entity: string;
        entityId?: string;
        oldData?: any;
        newData?: any;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<import("mongoose").Document<unknown, {}, AuditLogDocument, {}, {}> & AuditLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query?: any): Promise<{
        logs: (import("mongoose").FlattenMaps<AuditLogDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    private calculateDiff;
}
