import { Document, Types } from 'mongoose';
export type TestOrderDocument = TestOrder & Document;
export declare enum TestOrderStatus {
    ORDERED = "ORDERED",
    COLLECTED = "COLLECTED",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class TestOrder {
    orderNumber: string;
    clientId: Types.ObjectId;
    branchId: Types.ObjectId;
    tests: Types.ObjectId[];
    status: TestOrderStatus;
    sampleCollectedAt: Date;
    collectedBy: Types.ObjectId;
    orderedBy: Types.ObjectId;
    notes: string;
    totalAmount: number;
    discount: number;
    netAmount: number;
}
export declare const TestOrderSchema: import("mongoose").Schema<TestOrder, import("mongoose").Model<TestOrder, any, any, any, Document<unknown, any, TestOrder, any, {}> & TestOrder & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TestOrder, Document<unknown, {}, import("mongoose").FlatRecord<TestOrder>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TestOrder> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
