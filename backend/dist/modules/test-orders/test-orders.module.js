"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const test_order_schema_1 = require("./schemas/test-order.schema");
const test_orders_service_1 = require("./test-orders.service");
const test_orders_controller_1 = require("./test-orders.controller");
const test_master_module_1 = require("../test-master/test-master.module");
const lab_reports_module_1 = require("../lab-reports/lab-reports.module");
const counter_module_1 = require("../counter/counter.module");
const auth_module_1 = require("../auth/auth.module");
let TestOrdersModule = class TestOrdersModule {
};
exports.TestOrdersModule = TestOrdersModule;
exports.TestOrdersModule = TestOrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: test_order_schema_1.TestOrder.name, schema: test_order_schema_1.TestOrderSchema }]),
            test_master_module_1.TestMasterModule,
            lab_reports_module_1.LabReportsModule,
            counter_module_1.CounterModule,
            auth_module_1.AuthModule,
        ],
        controllers: [test_orders_controller_1.TestOrdersController],
        providers: [test_orders_service_1.TestOrdersService],
        exports: [test_orders_service_1.TestOrdersService],
    })
], TestOrdersModule);
//# sourceMappingURL=test-orders.module.js.map