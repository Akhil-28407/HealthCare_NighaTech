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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const Handlebars = require("handlebars");
const report_template_schema_1 = require("./schemas/report-template.schema");
let TemplatesService = class TemplatesService {
    constructor(templateModel) {
        this.templateModel = templateModel;
    }
    async create(dto) { return this.templateModel.create(dto); }
    async findAll(query = {}) {
        const { type } = query;
        const filter = { isActive: true };
        if (type)
            filter.type = type;
        return this.templateModel.find(filter).sort({ createdAt: -1 }).lean();
    }
    async findById(id) {
        const template = await this.templateModel.findById(id).lean();
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return template;
    }
    async update(id, dto) {
        const template = await this.templateModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return template;
    }
    async delete(id) {
        const template = await this.templateModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return { success: true, message: 'Template deactivated' };
    }
    async preview(id, data) {
        const template = await this.templateModel.findById(id);
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        Handlebars.registerHelper('eq', (a, b) => a === b);
        const compiled = Handlebars.compile(template.content);
        const sampleData = data || {
            patient: { name: 'John Doe', age: 35, gender: 'Male', mobile: '9876543210' },
            branch: { labName: 'Sample Lab', address: '123 Main St', phone: '1234567890', email: 'lab@example.com' },
            reportNumber: 'RPT-2024-0001',
            orderNumber: 'ORD-2024-0001',
            testName: 'Complete Blood Count',
            results: [
                { name: 'Hemoglobin', value: '14.5', unit: 'g/dL', normalRangeMin: 13, normalRangeMax: 17, flag: 'N' },
                { name: 'WBC Count', value: '12000', unit: '/cumm', normalRangeMin: 4000, normalRangeMax: 11000, flag: 'H' },
            ],
            invoice: { total: 1500 },
            reportDate: new Date().toLocaleDateString(),
            generatedAt: new Date().toLocaleString(),
        };
        return { html: compiled(sampleData) };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(report_template_schema_1.ReportTemplate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map