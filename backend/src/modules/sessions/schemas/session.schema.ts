import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  refreshTokenHash: string;

  @Prop()
  deviceInfo: string;

  @Prop()
  ipAddress: string;

  @Prop({ default: () => new Date() })
  lastActive: Date;

  @Prop({ default: false })
  isRevoked: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
