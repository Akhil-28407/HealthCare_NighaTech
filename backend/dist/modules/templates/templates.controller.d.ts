import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly service;
    constructor(service: TemplatesService);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/report-template.schema").ReportTemplateDocument, {}, {}> & import("./schemas/report-template.schema").ReportTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query: any): Promise<(import("mongoose").FlattenMaps<import("./schemas/report-template.schema").ReportTemplateDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/report-template.schema").ReportTemplateDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").FlattenMaps<import("./schemas/report-template.schema").ReportTemplateDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    preview(id: string, data: any): Promise<{
        html: string;
    }>;
}
