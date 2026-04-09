import { Document, Types } from 'mongoose';
export type InvoiceDocument = Invoice & Document;
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export declare class InvoiceItem {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}
export declare class Invoice {
    invoiceNumber: string;
    clientId: Types.ObjectId;
    branchId: Types.ObjectId;
    testOrderId: Types.ObjectId;
    quotationId: Types.ObjectId;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: InvoiceStatus;
    paidAt: Date;
    sentAt: Date;
    dueDate: Date;
    notes: string;
}
export declare const InvoiceSchema: import("mongoose").Schema<Invoice, import("mongoose").Model<Invoice, any, any, any, Document<unknown, any, Invoice, any, {}> & Invoice & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Invoice, Document<unknown, {}, import("mongoose").FlatRecord<Invoice>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Invoice> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
