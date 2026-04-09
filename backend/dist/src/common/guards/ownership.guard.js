"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../enums/role.enum");
let OwnershipGuard = class OwnershipGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if ([role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.ADMIN].includes(user.role)) {
            return true;
        }
        if (user.role === role_enum_1.Role.CLIENT) {
            const paramId = request.params.id || request.params.clientId;
            const queryClientId = request.query.clientId;
            if (paramId && paramId !== user.clientId && paramId !== user.sub) {
            }
            request.ownerFilter = { clientId: user.clientId || user.sub };
        }
        return true;
    }
};
exports.OwnershipGuard = OwnershipGuard;
exports.OwnershipGuard = OwnershipGuard = __decorate([
    (0, common_1.Injectable)()
], OwnershipGuard);
//# sourceMappingURL=ownership.guard.js.map