import { Response } from 'express';
import { QuotationsService } from './quotations.service';
import { PdfService } from '../pdf/pdf.service';
export declare class QuotationsController {
    private readonly service;
    private readonly pdfService;
    constructor(service: QuotationsService, pdfService: PdfService);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/quotation.schema").QuotationDocument, {}, {}> & import("./schemas/quotation.schema").Quotation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query: any): Promise<{
        quotations: (import("mongoose").FlattenMaps<import("./schemas/quotation.schema").QuotationDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/quotation.schema").QuotationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    downloadPdf(id: string, res: Response): Promise<void>;
    send(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    convert(id: string): Promise<import("mongoose").Document<unknown, {}, import("../invoices/schemas/invoice.schema").InvoiceDocument, {}, {}> & import("../invoices/schemas/invoice.schema").Invoice & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
