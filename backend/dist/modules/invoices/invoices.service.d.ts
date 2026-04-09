import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { ClientDocument } from '../clients/schemas/client.schema';
import { CounterService } from '../counter/counter.service';
import { MailService } from '../mail/mail.service';
export declare class InvoicesService {
    private invoiceModel;
    private clientModel;
    private counterService;
    private mailService;
    private configService;
    constructor(invoiceModel: Model<InvoiceDocument>, clientModel: Model<ClientDocument>, counterService: CounterService, mailService: MailService, configService: ConfigService);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, InvoiceDocument, {}, {}> & Invoice & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query?: any): Promise<{
        invoices: (import("mongoose").FlattenMaps<InvoiceDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<InvoiceDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    send(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markPaid(id: string): Promise<import("mongoose").Document<unknown, {}, InvoiceDocument, {}, {}> & Invoice & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
