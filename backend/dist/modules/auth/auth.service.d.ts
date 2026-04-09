import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { SessionDocument } from '../sessions/schemas/session.schema';
import { OtpStoreService } from './otp-store.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';
import { SendOtpDto, VerifyOtpDto, RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    private sessionModel;
    private jwtService;
    private configService;
    private otpStore;
    private mailService;
    private smsService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, sessionModel: Model<SessionDocument>, jwtService: JwtService, configService: ConfigService, otpStore: OtpStoreService, mailService: MailService, smsService: SmsService);
    sendOtp(dto: SendOtpDto): Promise<{
        success: boolean;
        message: string;
        otp: string;
    }>;
    verifyOtp(dto: VerifyOtpDto, ip: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            _id: any;
            name: any;
            email: any;
            mobile: any;
            role: any;
            branchId: any;
            isActive: any;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        userId: import("mongoose").Types.ObjectId;
    }>;
    login(dto: LoginDto, ip: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            _id: any;
            name: any;
            email: any;
            mobile: any;
            role: any;
            branchId: any;
            isActive: any;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    } | {
        resetUrl: string;
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshToken(dto: RefreshTokenDto, ip: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            _id: any;
            name: any;
            email: any;
            mobile: any;
            role: any;
            branchId: any;
            isActive: any;
        };
    }>;
    logout(userId: string, sessionId: string, accessToken: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSessions(userId: string): Promise<(import("mongoose").FlattenMaps<SessionDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    revokeAllSessions(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateTokensAndSession;
    private generateAccessToken;
    private generateRefreshToken;
    private sanitizeUser;
}
