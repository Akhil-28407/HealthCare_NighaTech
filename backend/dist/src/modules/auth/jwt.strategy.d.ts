import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userModel;
    constructor(configService: ConfigService, userModel: Model<UserDocument>);
    validate(payload: any): Promise<{
        sub: string;
        email: string;
        mobile: string;
        role: import("../../common/enums/role.enum").Role;
        name: string;
        branchId: string;
    }>;
}
export {};
