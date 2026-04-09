import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuotationDocument = Quotation & Document;

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  CONVERTED = 'CONVERTED',
  REJECTED = 'REJECTED',
}

export class QuotationItem {
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
export class Quotation {
  @Prop({ required: true, unique: true })
  quotationNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branchId: Types.ObjectId;

  @Prop({ type: [QuotationItem], default: [] })
  items: QuotationItem[];

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ type: String, enum: QuotationStatus, default: QuotationStatus.DRAFT })
  status: QuotationStatus;

  @Prop()
  validUntil: Date;

  @Prop()
  sentAt: Date;

  @Prop()
  notes: string;
}

export const QuotationSchema = SchemaFactory.createForClass(Quotation);
