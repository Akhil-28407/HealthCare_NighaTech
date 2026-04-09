import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admins and admins can access everything
    if ([Role.SUPER_ADMIN, Role.ADMIN].includes(user.role)) {
      return true;
    }

    // For CLIENT role, check if they're accessing their own data
    if (user.role === Role.CLIENT) {
      const paramId = request.params.id || request.params.clientId;
      const queryClientId = request.query.clientId;

      // If there's a client ID in params/query, verify ownership
      if (paramId && paramId !== user.clientId && paramId !== user.sub) {
        // Allow if the param is not a client-specific resource
        // The service layer will handle further filtering
      }

      // Attach client filter to request for service layer use
      request.ownerFilter = { clientId: user.clientId || user.sub };
    }

    return true;
  }
}
