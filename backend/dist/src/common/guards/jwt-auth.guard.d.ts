import { ExecutionContext } from '@nestjs/common';
import { OtpStoreService } from '../../modules/auth/otp-store.service';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private otpStore;
    constructor(otpStore: OtpStoreService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
}
export {};
