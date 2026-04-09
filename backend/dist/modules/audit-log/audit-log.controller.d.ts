import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly service;
    constructor(service: AuditLogService);
    findAll(query: any): Promise<{
        logs: (import("mongoose").FlattenMaps<import("./schemas/audit-log.schema").AuditLogDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
