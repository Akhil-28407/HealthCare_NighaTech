import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Session, SessionDocument } from '../sessions/schemas/session.schema';
import { OtpStoreService } from './otp-store.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';
import { Role } from '../../common/enums/role.enum';
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpStore: OtpStoreService,
    private mailService: MailService,
    private smsService: SmsService,
  ) {}

  // OTP Auth
  async sendOtp(dto: SendOtpDto) {
    // Rate limit check
    if (!this.otpStore.checkRateLimit(dto.mobile)) {
      throw new BadRequestException('Too many OTP requests. Try again after 10 minutes.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (5 min TTL)
    this.otpStore.storeOtp(dto.mobile, otp, 300);

    // Send OTP via SMS
    try {
      const smsSent = await this.smsService.sendOtp(dto.mobile, otp);
      if (!smsSent) {
        this.logger.error(`Failed to send OTP SMS to ${dto.mobile}`);
        // Optionally throw an exception if you want to fail the request
        // throw new BadRequestException('Failed to send OTP. Please try again later.');
      }
    } catch (error) {
      this.logger.error(`Error sending OTP SMS to ${dto.mobile}:`, error);
    }

    // In dev mode, return OTP in response
    return {
      success: true,
      message: 'OTP sent successfully',
      otp: this.configService.get('app.nodeEnv') === 'development' ? otp : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ip: string) {
    const storedOtp = this.otpStore.getOtp(dto.mobile);

    if (!storedOtp) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (storedOtp !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Delete OTP after use
    this.otpStore.deleteOtp(dto.mobile);

    // Find or create user
    let user = await this.userModel.findOne({ mobile: dto.mobile });
    if (!user) {
      user = await this.userModel.create({
        mobile: dto.mobile,
        name: `User-${dto.mobile.slice(-4)}`,
        role: Role.CLIENT,
      });
    }

    // Generate tokens
    return this.generateTokensAndSession(user, ip, dto.deviceInfo);
  }

  // Email Auth
  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      mobile: dto.mobile,
      role: Role.CLIENT,
    });

    return {
      success: true,
      message: 'Registration successful',
      userId: user._id,
    };
  }

  async login(dto: LoginDto, ip: string) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please use OTP login for this account');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    return this.generateTokensAndSession(user, ip, dto.deviceInfo);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      // Don't reveal if email exists
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 12);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `${this.configService.get('app.frontendUrl')}/reset-password?token=${resetToken}&email=${dto.email}`;

    try {
      await this.mailService.sendPasswordReset(dto.email, user.name, resetUrl);
    } catch (error) {
      this.logger.error('Failed to send password reset email:', error);
    }

    return {
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Dev mode: return reset URL
      ...(this.configService.get('app.nodeEnv') === 'development' && { resetUrl }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
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
      throw new BadRequestException('Invalid or expired reset token');
    }

    targetUser.password = await bcrypt.hash(dto.newPassword, 12);
    targetUser.resetPasswordToken = undefined;
    targetUser.resetPasswordExpires = undefined;
    await targetUser.save();

    return { success: true, message: 'Password reset successful' };
  }

  async refreshToken(dto: RefreshTokenDto, ip: string) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get('app.jwt.secret'),
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Find the session
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
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Blacklist old access token
      // Generate new tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update session
      validSession.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
      validSession.lastActive = new Date();
      validSession.ipAddress = ip;
      await validSession.save();

      return {
        accessToken,
        refreshToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId: string, accessToken: string) {
    if (sessionId) {
      await this.sessionModel.findOneAndUpdate(
        { _id: sessionId, userId },
        { isRevoked: true },
      );
    }

    if (accessToken) {
      this.otpStore.blacklistToken(accessToken, 900); // 15 min
    }

    return { success: true, message: 'Logged out successfully' };
  }

  async getSessions(userId: string) {
    return this.sessionModel
      .find({ userId, isRevoked: false })
      .sort({ lastActive: -1 })
      .lean();
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.sessionModel.findOneAndUpdate(
      { _id: sessionId, userId },
      { isRevoked: true },
      { new: true },
    );

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return { success: true, message: 'Session revoked' };
  }

  async revokeAllSessions(userId: string) {
    await this.sessionModel.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true },
    );

    return { success: true, message: 'All sessions revoked' };
  }

  // Helpers
  private async generateTokensAndSession(user: any, ip: string, deviceInfo?: string) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Create session
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

  private generateAccessToken(user: any): string {
    return this.jwtService.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        name: user.name,
      },
      { expiresIn: this.configService.get('app.jwt.accessExpiry') || '15m' },
    );
  }

  private generateRefreshToken(user: any): string {
    return this.jwtService.sign(
      { sub: user._id.toString(), type: 'refresh' },
      { expiresIn: this.configService.get('app.jwt.refreshExpiry') || '7d' },
    );
  }

  private sanitizeUser(user: any) {
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
}
