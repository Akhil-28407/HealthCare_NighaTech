export declare class SendOtpDto {
    mobile: string;
}
export declare class VerifyOtpDto {
    mobile: string;
    otp: string;
    deviceInfo?: string;
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    mobile?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
    deviceInfo?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
