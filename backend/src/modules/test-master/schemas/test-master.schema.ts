import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class TestParameter {
  @Prop({ required: true })
  name: string;

  @Prop()
  unit: string;

  @Prop()
  normalRangeMin: number;

  @Prop()
  normalRangeMax: number;

  @Prop()
  normalRangeText: string;

  @Prop()
  method: string;
}

export type TestMasterDocument = TestMaster & Document;

@Schema({ timestamps: true })
export class TestMaster {
  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branchId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  code: string;

  @Prop({ trim: true })
  category: string;

  @Prop()
  description: string;

  @Prop()
  sampleType: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ type: [TestParameter], default: [] })
  parameters: TestParameter[];

  @Prop()
  turnaroundTime: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TestMasterSchema = SchemaFactory.createForClass(TestMaster);

// Performance Indexes
TestMasterSchema.index({ branchId: 1, category: 1 });
TestMasterSchema.index({ name: 1 });
TestMasterSchema.index({ code: 1 });
TestMasterSchema.index({ isActive: 1, branchId: 1 });
