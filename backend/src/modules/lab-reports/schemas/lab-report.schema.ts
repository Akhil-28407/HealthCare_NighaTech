import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class ResultParameter {
  @Prop({ required: true })
  name: string;

  @Prop()
  value: string;

  @Prop()
  unit: string;

  @Prop()
  normalRangeMin: number;

  @Prop()
  normalRangeMax: number;

  @Prop()
  normalRangeText: string;

  @Prop({ enum: ['H', 'L', 'N', ''], default: '' })
  flag: string;

  @Prop()
  method: string;
}

export type LabReportDocument = LabReport & Document;

export enum ReportStatus {
  PENDING = 'PENDING',
  RESULTS_ENTERED = 'RESULTS_ENTERED',
  VERIFIED = 'VERIFIED',
}

@Schema({ timestamps: true })
export class LabReport {
  @Prop({ required: true, unique: true })
  reportNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'TestOrder', required: true })
  testOrderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TestMaster', required: true })
  testId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branchId: Types.ObjectId;

  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Prop({ type: [ResultParameter], default: [] })
  results: ResultParameter[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  enteredBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy: Types.ObjectId;

  @Prop()
  verifiedAt: Date;

  @Prop()
  notes: string;

  @Prop()
  htmlContent: string;

  @Prop()
  qrCode: string;
}

export const LabReportSchema = SchemaFactory.createForClass(LabReport);

// Performance Indexes
LabReportSchema.index({ branchId: 1, status: 1 });
LabReportSchema.index({ testOrderId: 1 });
LabReportSchema.index({ clientId: 1, createdAt: -1 });
LabReportSchema.index({ reportNumber: 1 }, { unique: true });
LabReportSchema.index({ status: 1, createdAt: -1 });
