import { Document, Types } from 'mongoose';
export declare class ResultParameter {
    name: string;
    value: string;
    unit: string;
    normalRangeMin: number;
    normalRangeMax: number;
    normalRangeText: string;
    flag: string;
    method: string;
}
export type LabReportDocument = LabReport & Document;
export declare enum ReportStatus {
    PENDING = "PENDING",
    RESULTS_ENTERED = "RESULTS_ENTERED",
    VERIFIED = "VERIFIED"
}
export declare class LabReport {
    reportNumber: string;
    testOrderId: Types.ObjectId;
    clientId: Types.ObjectId;
    testId: Types.ObjectId;
    branchId: Types.ObjectId;
    status: ReportStatus;
    results: ResultParameter[];
    enteredBy: Types.ObjectId;
    verifiedBy: Types.ObjectId;
    verifiedAt: Date;
    notes: string;
    qrCode: string;
}
export declare const LabReportSchema: import("mongoose").Schema<LabReport, import("mongoose").Model<LabReport, any, any, any, Document<unknown, any, LabReport, any, {}> & LabReport & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LabReport, Document<unknown, {}, import("mongoose").FlatRecord<LabReport>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LabReport> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
