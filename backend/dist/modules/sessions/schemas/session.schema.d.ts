import { Document, Types } from 'mongoose';
export type SessionDocument = Session & Document;
export declare class Session {
    userId: Types.ObjectId;
    refreshTokenHash: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: Date;
    isRevoked: boolean;
}
export declare const SessionSchema: import("mongoose").Schema<Session, import("mongoose").Model<Session, any, any, any, Document<unknown, any, Session, any, {}> & Session & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Session, Document<unknown, {}, import("mongoose").FlatRecord<Session>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Session> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
