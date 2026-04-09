import { Document } from 'mongoose';
export type ReportTemplateDocument = ReportTemplate & Document;
export declare class ReportTemplate {
    name: string;
    content: string;
    type: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
}
export declare const ReportTemplateSchema: import("mongoose").Schema<ReportTemplate, import("mongoose").Model<ReportTemplate, any, any, any, Document<unknown, any, ReportTemplate, any, {}> & ReportTemplate & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReportTemplate, Document<unknown, {}, import("mongoose").FlatRecord<ReportTemplate>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReportTemplate> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
