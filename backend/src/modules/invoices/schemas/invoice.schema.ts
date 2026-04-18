import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export class InvoiceItem {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  amount: number;
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TestOrder' })
  testOrderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quotation' })
  quotationId: Types.ObjectId;

  @Prop()
  quotationNumber: string;

  @Prop({ type: [InvoiceItem], default: [] })
  items: InvoiceItem[];

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ type: String, enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop()
  paidAt: Date;

  @Prop()
  sentAt: Date;

  @Prop()
  dueDate: Date;

  @Prop()
  notes: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Performance Indexes
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ branchId: 1, createdAt: -1 });
InvoiceSchema.index({ branchId: 1, status: 1 });
InvoiceSchema.index({ clientId: 1, createdAt: -1 });
InvoiceSchema.index({ status: 1, createdAt: -1 });
InvoiceSchema.index({ testOrderId: 1 });
