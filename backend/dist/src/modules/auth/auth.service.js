"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const user_schema_1 = require("../users/schemas/user.schema");
const session_schema_1 = require("../sessions/schemas/session.schema");
const otp_store_service_1 = require("./otp-store.service");
const mail_service_1 = require("../mail/mail.service");
const sms_service_1 = require("../sms/sms.service");
const role_enum_1 = require("../../common/enums/role.enum");
let AuthService = AuthService_1 = class AuthService {
    constructor(userModel, sessionModel, jwtService, configService, otpStore, mailService, smsService) {
        this.userModel = userModel;
        this.sessionModel = sessionModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.otpStore = otpStore;
        this.mailService = mailService;
        this.smsService = smsService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async sendOtp(dto) {
        if (!this.otpStore.checkRateLimit(dto.mobile)) {
            throw new common_1.BadRequestException('Too many OTP requests. Try again after 10 minutes.');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpStore.storeOtp(dto.mobile, otp, 300);
        try {
            const smsSent = await this.smsService.sendOtp(dto.mobile, otp);
            if (!smsSent) {
                this.logger.error(`Failed to send OTP SMS to ${dto.mobile}`);
            }
        }
        catch (error) {
            this.logger.error(`Error sending OTP SMS to ${dto.mobile}:`, error);
        }
        return {
            success: true,
            message: 'OTP sent successfully',
            otp: this.configService.get('app.nodeEnv') === 'development' ? otp : undefined,
        };
    }
    async verifyOtp(dto, ip) {
        const storedOtp = this.otpStore.getOtp(dto.mobile);
        if (!storedOtp) {
            throw new common_1.BadRequestException('OTP expired or not found');
        }
        if (storedOtp !== dto.otp) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        this.otpStore.deleteOtp(dto.mobile);
        let user = await this.userModel.findOne({ mobile: dto.mobile });
        if (!user) {
            user = await this.userModel.create({
                mobile: dto.mobile,
                name: `User-${dto.mobile.slice(-4)}`,
                role: role_enum_1.Role.CLIENT,
            });
        }
        return this.generateTokensAndSession(user, ip, dto.deviceInfo);
    }
    async register(dto) {
        const existing = await this.userModel.findOne({ email: dto.email });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.userModel.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            mobile: dto.mobile,
            role: role_enum_1.Role.CLIENT,
        });
        return {
            success: true,
            message: 'Registration successful',
            userId: user._id,
        };
    }
    async login(dto, ip) {
        const user = await this.userModel.findOne({ email: dto.email });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Please use OTP login for this account');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        return this.generateTokensAndSession(user, ip, dto.deviceInfo);
    }
    async forgotPassword(dto) {
        const user = await this.userModel.findOne({ email: dto.email });
        if (!user) {
            return { success: true, message: 'If the email exists, a reset link has been sent' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 12);
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();
        const resetUrl = `${this.configService.get('app.frontendUrl')}/reset-password?token=${resetToken}&email=${dto.email}`;
        try {
            await this.mailService.sendPasswordReset(dto.email, user.name, resetUrl);
        }
        catch (error) {
            this.logger.error('Failed to send password reset email:', error);
        }
        return {
            success: true,
            message: 'If the email exists, a reset link has been sent',
            ...(this.configService.get('app.nodeEnv') === 'development' && { resetUrl }),
        };
    }
    async resetPassword(dto) {
        const users = await this.userModel.find({
            resetPasswordExpires: { $gt: new Date() },
        });
        let targetUser = null;
        for (const user of users) {
            if (user.resetPasswordToken) {
                const isValid = await bcrypt.compare(dto.token, user.resetPasswordToken);
                if (isValid) {
                    targetUser = user;
                    break;
                }
            }
        }
        if (!targetUser) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        targetUser.password = await bcrypt.hash(dto.newPassword, 12);
        targetUser.resetPasswordToken = undefined;
        targetUser.resetPasswordExpires = undefined;
        await targetUser.save();
        return { success: true, message: 'Password reset successful' };
    }
    async refreshToken(dto, ip) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.get('app.jwt.secret'),
            });
            const user = await this.userModel.findById(payload.sub);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            const sessions = await this.sessionModel.find({
                userId: user._id,
                isRevoked: false,
            });
            let validSession = null;
            for (const session of sessions) {
                const isValid = await bcrypt.compare(dto.refreshToken, session.refreshTokenHash);
                if (isValid) {
                    validSession = session;
                    break;
                }
            }
            if (!validSession) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
            validSession.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
            validSession.lastActive = new Date();
            validSession.ipAddress = ip;
            await validSession.save();
            return {
                accessToken,
                refreshToken,
                user: this.sanitizeUser(user),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId, sessionId, accessToken) {
        if (sessionId) {
            await this.sessionModel.findOneAndUpdate({ _id: sessionId, userId }, { isRevoked: true });
        }
        if (accessToken) {
            this.otpStore.blacklistToken(accessToken, 900);
        }
        return { success: true, message: 'Logged out successfully' };
    }
    async getSessions(userId) {
        return this.sessionModel
            .find({ userId, isRevoked: false })
            .sort({ lastActive: -1 })
            .lean();
    }
    async revokeSession(userId, sessionId) {
        const session = await this.sessionModel.findOneAndUpdate({ _id: sessionId, userId }, { isRevoked: true }, { new: true });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return { success: true, message: 'Session revoked' };
    }
    async revokeAllSessions(userId) {
        await this.sessionModel.updateMany({ userId, isRevoked: false }, { isRevoked: true });
        return { success: true, message: 'All sessions revoked' };
    }
    async generateTokensAndSession(user, ip, deviceInfo) {
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        await this.sessionModel.create({
            userId: user._id,
            refreshTokenHash,
            deviceInfo: deviceInfo || 'Unknown',
            ipAddress: ip,
            lastActive: new Date(),
        });
        return {
            accessToken,
            refreshToken,
            user: this.sanitizeUser(user),
        };
    }
    generateAccessToken(user) {
        return this.jwtService.sign({
            sub: user._id.toString(),
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            name: user.name,
        }, { expiresIn: this.configService.get('app.jwt.accessExpiry') || '15m' });
    }
    generateRefreshToken(user) {
        return this.jwtService.sign({ sub: user._id.toString(), type: 'refresh' }, { expiresIn: this.configService.get('app.jwt.refreshExpiry') || '7d' });
    }
    sanitizeUser(user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            branchId: user.branchId,
            isActive: user.isActive,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        otp_store_service_1.OtpStoreService,
        mail_service_1.MailService,
        sms_service_1.SmsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map