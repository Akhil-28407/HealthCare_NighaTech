import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OtpStoreService } from '../../modules/auth/otp-store.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private otpStore: OtpStoreService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    if (!result) return false;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    // Check if token is blacklisted
    if (token && this.otpStore.isTokenBlacklisted(token)) {
      return false;
    }

    return true;
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
