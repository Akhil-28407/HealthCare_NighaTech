import { Document, Types } from 'mongoose';
export type QuotationDocument = Quotation & Document;
export declare enum QuotationStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    ACCEPTED = "ACCEPTED",
    CONVERTED = "CONVERTED",
    REJECTED = "REJECTED"
}
export declare class QuotationItem {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}
export declare class Quotation {
    quotationNumber: string;
    clientId: Types.ObjectId;
    branchId: Types.ObjectId;
    items: QuotationItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: QuotationStatus;
    validUntil: Date;
    sentAt: Date;
    notes: string;
}
export declare const QuotationSchema: import("mongoose").Schema<Quotation, import("mongoose").Model<Quotation, any, any, any, Document<unknown, any, Quotation, any, {}> & Quotation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Quotation, Document<unknown, {}, import("mongoose").FlatRecord<Quotation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Quotation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
