import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportTemplateDocument = ReportTemplate & Document;

@Schema({ timestamps: true })
export class ReportTemplate {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: ['lab_report', 'invoice', 'quotation'], default: 'lab_report' })
  type: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ReportTemplateSchema = SchemaFactory.createForClass(ReportTemplate);
