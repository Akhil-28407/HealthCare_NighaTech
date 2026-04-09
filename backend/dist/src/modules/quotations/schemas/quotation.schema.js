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
exports.QuotationSchema = exports.Quotation = exports.QuotationItem = exports.QuotationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["DRAFT"] = "DRAFT";
    QuotationStatus["SENT"] = "SENT";
    QuotationStatus["ACCEPTED"] = "ACCEPTED";
    QuotationStatus["CONVERTED"] = "CONVERTED";
    QuotationStatus["REJECTED"] = "REJECTED";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
class QuotationItem {
}
exports.QuotationItem = QuotationItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuotationItem.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], QuotationItem.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], QuotationItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], QuotationItem.prototype, "unitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], QuotationItem.prototype, "amount", void 0);
let Quotation = class Quotation {
};
exports.Quotation = Quotation;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Quotation.prototype, "quotationNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Client', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quotation.prototype, "clientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quotation.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [QuotationItem], default: [] }),
    __metadata("design:type", Array)
], Quotation.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "tax", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "discount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "total", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: QuotationStatus, default: QuotationStatus.DRAFT }),
    __metadata("design:type", String)
], Quotation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Quotation.prototype, "validUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Quotation.prototype, "sentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Quotation.prototype, "notes", void 0);
exports.Quotation = Quotation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Quotation);
exports.QuotationSchema = mongoose_1.SchemaFactory.createForClass(Quotation);
//# sourceMappingURL=quotation.schema.js.map