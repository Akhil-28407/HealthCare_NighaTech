import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TestOrderDocument = TestOrder & Document;

export enum TestOrderStatus {
  ORDERED = 'ORDERED',
  COLLECTED = 'COLLECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class TestOrder {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branchId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'TestMaster' }], required: true })
  tests: Types.ObjectId[];

  @Prop({ type: String, enum: TestOrderStatus, default: TestOrderStatus.ORDERED })
  status: TestOrderStatus;

  @Prop()
  sampleCollectedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  collectedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  orderedBy: Types.ObjectId;

  @Prop()
  notes: string;

  @Prop()
  clientName: string;

  @Prop()
  clientGst: string;

  @Prop()
  quotationNumber: string;

  @Prop()
  address: string;

  @Prop({ default: 'NORMAL' })
  serviceType: string;

  @Prop()
  contactPersonName: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  netAmount: number;
}

export const TestOrderSchema = SchemaFactory.createForClass(TestOrder);

// Performance Indexes
TestOrderSchema.index({ orderNumber: 1 }, { unique: true });
TestOrderSchema.index({ branchId: 1, createdAt: -1 });
TestOrderSchema.index({ branchId: 1, status: 1 });
TestOrderSchema.index({ clientId: 1, createdAt: -1 });
TestOrderSchema.index({ status: 1, createdAt: -1 });
TestOrderSchema.index({ clientName: 'text', orderNumber: 'text' });
