import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BranchUpdateRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class BranchUpdateRequest {
  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: Object, required: true })
  oldData: any;

  @Prop({ type: Object, required: true })
  newData: any;

  @Prop({ type: String, enum: BranchUpdateRequestStatus, default: BranchUpdateRequestStatus.PENDING })
  status: BranchUpdateRequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedBy: Types.ObjectId;

  @Prop()
  rejectionReason: string;
}

export type BranchUpdateRequestDocument = BranchUpdateRequest & Document;
export const BranchUpdateRequestSchema = SchemaFactory.createForClass(BranchUpdateRequest);

// Index for fast lookups by status and branch
BranchUpdateRequestSchema.index({ status: 1, createdAt: -1 });
BranchUpdateRequestSchema.index({ branchId: 1, status: 1 });
