import { Model } from 'mongoose';
import { TestMaster, TestMasterDocument } from './schemas/test-master.schema';
export declare class TestMasterService {
    private testModel;
    constructor(testModel: Model<TestMasterDocument>);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, TestMasterDocument, {}, {}> & TestMaster & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query?: any): Promise<{
        tests: (import("mongoose").FlattenMaps<TestMasterDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<TestMasterDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").FlattenMaps<TestMasterDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
