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
exports.TestOrderSchema = exports.TestOrder = exports.TestOrderStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TestOrderStatus;
(function (TestOrderStatus) {
    TestOrderStatus["ORDERED"] = "ORDERED";
    TestOrderStatus["COLLECTED"] = "COLLECTED";
    TestOrderStatus["PROCESSING"] = "PROCESSING";
    TestOrderStatus["COMPLETED"] = "COMPLETED";
    TestOrderStatus["CANCELLED"] = "CANCELLED";
})(TestOrderStatus || (exports.TestOrderStatus = TestOrderStatus = {}));
let TestOrder = class TestOrder {
};
exports.TestOrder = TestOrder;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], TestOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Client', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TestOrder.prototype, "clientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TestOrder.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'TestMaster' }], required: true }),
    __metadata("design:type", Array)
], TestOrder.prototype, "tests", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: TestOrderStatus, default: TestOrderStatus.ORDERED }),
    __metadata("design:type", String)
], TestOrder.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], TestOrder.prototype, "sampleCollectedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TestOrder.prototype, "collectedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TestOrder.prototype, "orderedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TestOrder.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TestOrder.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TestOrder.prototype, "discount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TestOrder.prototype, "netAmount", void 0);
exports.TestOrder = TestOrder = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TestOrder);
exports.TestOrderSchema = mongoose_1.SchemaFactory.createForClass(TestOrder);
//# sourceMappingURL=test-order.schema.js.map