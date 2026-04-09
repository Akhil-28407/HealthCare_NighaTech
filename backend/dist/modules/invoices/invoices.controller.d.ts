import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { PdfService } from '../pdf/pdf.service';
export declare class InvoicesController {
    private readonly service;
    private readonly pdfService;
    constructor(service: InvoicesService, pdfService: PdfService);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/invoice.schema").InvoiceDocument, {}, {}> & import("./schemas/invoice.schema").Invoice & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query: any): Promise<{
        invoices: (import("mongoose").FlattenMaps<import("./schemas/invoice.schema").InvoiceDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/invoice.schema").InvoiceDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    downloadPdf(id: string, res: Response): Promise<void>;
    send(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markPaid(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/invoice.schema").InvoiceDocument, {}, {}> & import("./schemas/invoice.schema").Invoice & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
