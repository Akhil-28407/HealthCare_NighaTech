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
exports.LabReportSchema = exports.LabReport = exports.ReportStatus = exports.ResultParameter = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
class ResultParameter {
}
exports.ResultParameter = ResultParameter;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResultParameter.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ResultParameter.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ResultParameter.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ResultParameter.prototype, "normalRangeMin", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ResultParameter.prototype, "normalRangeMax", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ResultParameter.prototype, "normalRangeText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['H', 'L', 'N', ''], default: '' }),
    __metadata("design:type", String)
], ResultParameter.prototype, "flag", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ResultParameter.prototype, "method", void 0);
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["RESULTS_ENTERED"] = "RESULTS_ENTERED";
    ReportStatus["VERIFIED"] = "VERIFIED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
let LabReport = class LabReport {
};
exports.LabReport = LabReport;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], LabReport.prototype, "reportNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'TestOrder', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LabReport.prototype, "testOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Client', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LabReport.prototype, "clientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'TestMaster', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LabReport.prototype, "testId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LabReport.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ReportStatus, default: ReportStatus.PENDING }),
    __metadata("design:type", String)
], LabReport.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ResultParameter], default: [] }),
    __metadata("design:type", Array)
], LabReport.prototype, "results", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LabReport.prototype, "enteredBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LabReport.prototype, "verifiedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LabReport.prototype, "verifiedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LabReport.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LabReport.prototype, "qrCode", void 0);
exports.LabReport = LabReport = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LabReport);
exports.LabReportSchema = mongoose_1.SchemaFactory.createForClass(LabReport);
//# sourceMappingURL=lab-report.schema.js.map