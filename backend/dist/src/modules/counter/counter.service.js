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
exports.CounterService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const counter_schema_1 = require("./schemas/counter.schema");
let CounterService = class CounterService {
    constructor(counterModel) {
        this.counterModel = counterModel;
    }
    async getNextSequence(key) {
        const counter = await this.counterModel.findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        return counter.seq;
    }
    async generateNumber(prefix, entity) {
        const year = new Date().getFullYear();
        const key = `${entity}-${year}`;
        const seq = await this.getNextSequence(key);
        return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
    }
};
exports.CounterService = CounterService;
exports.CounterService = CounterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(counter_schema_1.Counter.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CounterService);
//# sourceMappingURL=counter.service.js.map