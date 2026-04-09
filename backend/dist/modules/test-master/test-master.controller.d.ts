import { TestMasterService } from './test-master.service';
export declare class TestMasterController {
    private readonly testMasterService;
    constructor(testMasterService: TestMasterService);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/test-master.schema").TestMasterDocument, {}, {}> & import("./schemas/test-master.schema").TestMaster & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query: any): Promise<{
        tests: (import("mongoose").FlattenMaps<import("./schemas/test-master.schema").TestMasterDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/test-master.schema").TestMasterDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").FlattenMaps<import("./schemas/test-master.schema").TestMasterDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
