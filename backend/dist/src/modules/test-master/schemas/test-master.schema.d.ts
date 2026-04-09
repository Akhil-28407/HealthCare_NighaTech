import { Document } from 'mongoose';
export declare class TestParameter {
    name: string;
    unit: string;
    normalRangeMin: number;
    normalRangeMax: number;
    normalRangeText: string;
    method: string;
}
export type TestMasterDocument = TestMaster & Document;
export declare class TestMaster {
    name: string;
    code: string;
    category: string;
    description: string;
    sampleType: string;
    price: number;
    parameters: TestParameter[];
    turnaroundTime: string;
    isActive: boolean;
}
export declare const TestMasterSchema: import("mongoose").Schema<TestMaster, import("mongoose").Model<TestMaster, any, any, any, Document<unknown, any, TestMaster, any, {}> & TestMaster & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TestMaster, Document<unknown, {}, import("mongoose").FlatRecord<TestMaster>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TestMaster> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
