export declare class OtpStoreService {
    private readonly logger;
    private otpStore;
    private rateLimitStore;
    private blacklistedTokens;
    constructor();
    storeOtp(mobile: string, otp: string, ttlSeconds?: number): void;
    getOtp(mobile: string): string | null;
    deleteOtp(mobile: string): void;
    checkRateLimit(mobile: string, maxRequests?: number, windowSeconds?: number): boolean;
    blacklistToken(token: string, ttlSeconds?: number): void;
    isTokenBlacklisted(token: string): boolean;
    private cleanup;
}
