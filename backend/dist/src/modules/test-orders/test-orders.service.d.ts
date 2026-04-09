import { Model, Types } from 'mongoose';
import { TestOrder, TestOrderDocument, TestOrderStatus } from './schemas/test-order.schema';
import { TestMasterDocument } from '../test-master/schemas/test-master.schema';
import { LabReportDocument } from '../lab-reports/schemas/lab-report.schema';
import { CounterService } from '../counter/counter.service';
export declare class TestOrdersService {
    private orderModel;
    private testModel;
    private reportModel;
    private counterService;
    constructor(orderModel: Model<TestOrderDocument>, testModel: Model<TestMasterDocument>, reportModel: Model<LabReportDocument>, counterService: CounterService);
    create(dto: any, userId: string): Promise<import("mongoose").Document<unknown, {}, TestOrderDocument, {}, {}> & TestOrder & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query?: any): Promise<{
        orders: (import("mongoose").FlattenMaps<TestOrderDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<TestOrderDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    collectSample(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, TestOrderDocument, {}, {}> & TestOrder & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus(id: string, status: TestOrderStatus): Promise<import("mongoose").Document<unknown, {}, TestOrderDocument, {}, {}> & TestOrder & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
