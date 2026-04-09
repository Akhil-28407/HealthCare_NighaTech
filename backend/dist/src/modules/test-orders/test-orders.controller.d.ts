import { TestOrdersService } from './test-orders.service';
export declare class TestOrdersController {
    private readonly service;
    constructor(service: TestOrdersService);
    create(dto: any, userId: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/test-order.schema").TestOrderDocument, {}, {}> & import("./schemas/test-order.schema").TestOrder & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query: any): Promise<{
        orders: (import("mongoose").FlattenMaps<import("./schemas/test-order.schema").TestOrderDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/test-order.schema").TestOrderDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    collectSample(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/test-order.schema").TestOrderDocument, {}, {}> & import("./schemas/test-order.schema").TestOrder & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
