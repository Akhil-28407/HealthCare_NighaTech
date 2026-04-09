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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportTemplateSchema = exports.ReportTemplate = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ReportTemplate = class ReportTemplate {
};
exports.ReportTemplate = ReportTemplate;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ReportTemplate.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReportTemplate.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['lab_report', 'invoice', 'quotation'], default: 'lab_report' }),
    __metadata("design:type", String)
], ReportTemplate.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReportTemplate.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ReportTemplate.prototype, "isDefault", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ReportTemplate.prototype, "isActive", void 0);
exports.ReportTemplate = ReportTemplate = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ReportTemplate);
exports.ReportTemplateSchema = mongoose_1.SchemaFactory.createForClass(ReportTemplate);
//# sourceMappingURL=report-template.schema.js.map