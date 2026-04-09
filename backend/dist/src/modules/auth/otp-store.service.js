"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OtpStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpStoreService = void 0;
const common_1 = require("@nestjs/common");
let OtpStoreService = OtpStoreService_1 = class OtpStoreService {
    constructor() {
        this.logger = new common_1.Logger(OtpStoreService_1.name);
        this.otpStore = new Map();
        this.rateLimitStore = new Map();
        this.blacklistedTokens = new Set();
        setInterval(() => this.cleanup(), 60000);
    }
    storeOtp(mobile, otp, ttlSeconds = 300) {
        this.otpStore.set(mobile, {
            otp,
            expiresAt: Date.now() + ttlSeconds * 1000,
            attempts: 0,
        });
        this.logger.log(`OTP stored for ${mobile}: ${otp}`);
    }
    getOtp(mobile) {
        const entry = this.otpStore.get(mobile);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.otpStore.delete(mobile);
            return null;
        }
        return entry.otp;
    }
    deleteOtp(mobile) {
        this.otpStore.delete(mobile);
    }
    checkRateLimit(mobile, maxRequests = 3, windowSeconds = 600) {
        const key = `rate:${mobile}`;
        const entry = this.rateLimitStore.get(key);
        const now = Date.now();
        if (!entry || now - entry.windowStart > windowSeconds * 1000) {
            this.rateLimitStore.set(key, { count: 1, windowStart: now });
            return true;
        }
        if (entry.count >= maxRequests) {
            return false;
        }
        entry.count++;
        return true;
    }
    blacklistToken(token, ttlSeconds = 900) {
        this.blacklistedTokens.add(token);
        setTimeout(() => {
            this.blacklistedTokens.delete(token);
        }, ttlSeconds * 1000);
    }
    isTokenBlacklisted(token) {
        return this.blacklistedTokens.has(token);
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.otpStore.entries()) {
            if (now > entry.expiresAt) {
                this.otpStore.delete(key);
            }
        }
        for (const [key, entry] of this.rateLimitStore.entries()) {
            if (now - entry.windowStart > 600000) {
                this.rateLimitStore.delete(key);
            }
        }
    }
};
exports.OtpStoreService = OtpStoreService;
exports.OtpStoreService = OtpStoreService = OtpStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OtpStoreService);
//# sourceMappingURL=otp-store.service.js.map