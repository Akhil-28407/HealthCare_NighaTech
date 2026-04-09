import { Document, Types } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';
export type UserDocument = User & Document;
export declare class User {
    name: string;
    email: string;
    mobile: string;
    password: string;
    role: Role;
    branchId: Types.ObjectId;
    isActive: boolean;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
