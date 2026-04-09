import { Response } from 'express';
import { LabReportsService } from './lab-reports.service';
import { PdfService } from '../pdf/pdf.service';
export declare class LabReportsController {
    private readonly service;
    private readonly pdfService;
    constructor(service: LabReportsService, pdfService: PdfService);
    findAll(query: any, user: any): Promise<{
        reports: (import("mongoose").FlattenMaps<import("./schemas/lab-report.schema").LabReportDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/lab-report.schema").LabReportDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    downloadPdf(id: string, res: Response): Promise<void>;
    updateResults(id: string, results: any[], userId: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/lab-report.schema").LabReportDocument, {}, {}> & import("./schemas/lab-report.schema").LabReport & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    verify(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/lab-report.schema").LabReportDocument, {}, {}> & import("./schemas/lab-report.schema").LabReport & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
