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
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("./schemas/audit-log.schema");
let AuditLogService = class AuditLogService {
    constructor(auditModel) {
        this.auditModel = auditModel;
    }
    async log(data) {
        const diff = this.calculateDiff(data.oldData, data.newData);
        return this.auditModel.create({
            userId: data.userId ? new mongoose_2.Types.ObjectId(data.userId) : undefined,
            action: data.action,
            entity: data.entity,
            entityId: data.entityId ? new mongoose_2.Types.ObjectId(data.entityId) : undefined,
            oldData: data.oldData,
            newData: data.newData,
            diff,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        });
    }
    async findAll(query = {}) {
        const { page = 1, limit = 50, entity, action, userId } = query;
        const filter = {};
        if (entity)
            filter.entity = entity;
        if (action)
            filter.action = action;
        if (userId)
            filter.userId = userId;
        const [logs, total] = await Promise.all([
            this.auditModel.find(filter)
                .populate('userId', 'name email')
                .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean(),
            this.auditModel.countDocuments(filter),
        ]);
        return { logs, total, page: Number(page), limit: Number(limit) };
    }
    calculateDiff(oldData, newData) {
        if (!oldData || !newData)
            return {};
        const diff = {};
        const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
        for (const key of allKeys) {
            if (key === '_id' || key === '__v' || key === 'updatedAt' || key === 'createdAt')
                continue;
            if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
                diff[key] = { old: oldData[key], new: newData[key] };
            }
        }
        return diff;
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map