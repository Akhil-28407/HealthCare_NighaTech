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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const branch_schema_1 = require("./schemas/branch.schema");
let BranchesService = class BranchesService {
    constructor(branchModel) {
        this.branchModel = branchModel;
    }
    async create(dto) {
        return this.branchModel.create(dto);
    }
    async findAll(query = {}) {
        const { page = 1, limit = 20, search } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
            ];
        }
        const [branches, total] = await Promise.all([
            this.branchModel.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
            this.branchModel.countDocuments(filter),
        ]);
        return { branches, total, page: Number(page), limit: Number(limit) };
    }
    async findById(id) {
        const branch = await this.branchModel.findById(id).lean();
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return branch;
    }
    async update(id, dto) {
        const branch = await this.branchModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return branch;
    }
    async delete(id) {
        const branch = await this.branchModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return { success: true, message: 'Branch deactivated' };
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(branch_schema_1.Branch.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BranchesService);
//# sourceMappingURL=branches.service.js.map