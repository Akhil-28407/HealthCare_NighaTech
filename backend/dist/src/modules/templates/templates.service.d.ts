import { Model } from 'mongoose';
import { ReportTemplate, ReportTemplateDocument } from './schemas/report-template.schema';
export declare class TemplatesService {
    private templateModel;
    constructor(templateModel: Model<ReportTemplateDocument>);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, ReportTemplateDocument, {}, {}> & ReportTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query?: any): Promise<(import("mongoose").FlattenMaps<ReportTemplateDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<ReportTemplateDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: any): Promise<import("mongoose").FlattenMaps<ReportTemplateDocument> & Required<{
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
