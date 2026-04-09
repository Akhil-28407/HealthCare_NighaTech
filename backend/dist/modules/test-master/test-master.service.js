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
exports.TestMasterService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const test_master_schema_1 = require("./schemas/test-master.schema");
let TestMasterService = class TestMasterService {
    constructor(testModel) {
        this.testModel = testModel;
    }
    async create(dto) { return this.testModel.create(dto); }
    async findAll(query = {}) {
        const { page = 1, limit = 50, search, category } = query;
        const filter = { isActive: true };
        if (category)
            filter.category = category;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
            ];
        }
        const [tests, total] = await Promise.all([
            this.testModel.find(filter).skip((page - 1) * limit).limit(limit).sort({ name: 1 }).lean(),
            this.testModel.countDocuments(filter),
        ]);
        return { tests, total, page: Number(page), limit: Number(limit) };
    }
    async findById(id) {
        const test = await this.testModel.findById(id).lean();
        if (!test)
            throw new common_1.NotFoundException('Test not found');
        return test;
    }
    async update(id, dto) {
        const test = await this.testModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!test)
            throw new common_1.NotFoundException('Test not found');
        return test;
    }
    async delete(id) {
        const test = await this.testModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!test)
            throw new common_1.NotFoundException('Test not found');
        return { success: true, message: 'Test deactivated' };
    }
};
exports.TestMasterService = TestMasterService;
exports.TestMasterService = TestMasterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(test_master_schema_1.TestMaster.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TestMasterService);
//# sourceMappingURL=test-master.service.js.map