import { Injectable, Logger } from '@nestjs/common';

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

@Injectable()
export class OtpStoreService {
  private readonly logger = new Logger(OtpStoreService.name);
  private otpStore = new Map<string, OtpEntry>();
  private rateLimitStore = new Map<string, RateLimitEntry>();
  private blacklistedTokens = new Set<string>();

  constructor() {
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // OTP Methods
  storeOtp(mobile: string, otp: string, ttlSeconds = 300): void {
    this.otpStore.set(mobile, {
      otp,
      expiresAt: Date.now() + ttlSeconds * 1000,
      attempts: 0,
    });
    this.logger.log(`OTP stored for ${mobile}: ${otp}`);
  }

  getOtp(mobile: string): string | null {
    const entry = this.otpStore.get(mobile);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(mobile);
      return null;
    }
    return entry.otp;
  }

  deleteOtp(mobile: string): void {
    this.otpStore.delete(mobile);
  }

  // Rate Limiting
  checkRateLimit(mobile: string, maxRequests = 3, windowSeconds = 600): boolean {
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

  // Token Blacklist
  blacklistToken(token: string, ttlSeconds = 900): void {
    this.blacklistedTokens.add(token);
    // Auto-remove after TTL
    setTimeout(() => {
      this.blacklistedTokens.delete(token);
    }, ttlSeconds * 1000);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // Cleanup expired entries
  private cleanup(): void {
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
}
