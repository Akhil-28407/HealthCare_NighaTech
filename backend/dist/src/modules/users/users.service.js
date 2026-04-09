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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const existing = await this.userModel.findOne({
            $or: [
                ...(createUserDto.email ? [{ email: createUserDto.email }] : []),
                ...(createUserDto.mobile ? [{ mobile: createUserDto.mobile }] : []),
            ],
        });
        if (existing) {
            throw new common_1.ConflictException('User with this email or mobile already exists');
        }
        if (createUserDto.password) {
            createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
        }
        return this.userModel.create(createUserDto);
    }
    async findAll(query = {}) {
        const { page = 1, limit = 20, role, branchId, search } = query;
        const filter = {};
        if (role)
            filter.role = role;
        if (branchId)
            filter.branchId = branchId;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.userModel
                .find(filter)
                .select('-password -resetPasswordToken -resetPasswordExpires')
                .populate('branchId', 'name')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            this.userModel.countDocuments(filter),
        ]);
        return { users, total, page: Number(page), limit: Number(limit) };
    }
    async findById(id) {
        const user = await this.userModel
            .findById(id)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .populate('branchId', 'name')
            .lean();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, updateDto) {
        if (updateDto.password) {
            updateDto.password = await bcrypt.hash(updateDto.password, 12);
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .lean();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async delete(id) {
        const user = await this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { success: true, message: 'User deactivated' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map