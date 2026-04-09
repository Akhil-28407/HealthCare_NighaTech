import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(dto: SendOtpDto): Promise<{
        success: boolean;
        message: string;
        otp: string;
    }>;
    verifyOtp(dto: VerifyOtpDto, req: any): Promise<{
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
    login(dto: LoginDto, req: any): Promise<{
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
    refreshToken(dto: RefreshTokenDto, req: any): Promise<{
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
    logout(userId: string, sessionId: string, authHeader: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSessions(userId: string): Promise<(import("mongoose").FlattenMaps<import("../sessions/schemas/session.schema").SessionDocument> & Required<{
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
}
