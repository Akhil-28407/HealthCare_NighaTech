import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { LabReport, LabReportDocument } from './schemas/lab-report.schema';
import { TestOrderDocument } from '../test-orders/schemas/test-order.schema';
import { ClientDocument } from '../clients/schemas/client.schema';
export declare class LabReportsService {
    private reportModel;
    private orderModel;
    private clientModel;
    private configService;
    constructor(reportModel: Model<LabReportDocument>, orderModel: Model<TestOrderDocument>, clientModel: Model<ClientDocument>, configService: ConfigService);
    findAll(query: any, user: any): Promise<{
        reports: (import("mongoose").FlattenMaps<LabReportDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<LabReportDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateResults(id: string, results: any[], userId: string): Promise<import("mongoose").Document<unknown, {}, LabReportDocument, {}, {}> & LabReport & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    verifyReport(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, LabReportDocument, {}, {}> & LabReport & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
