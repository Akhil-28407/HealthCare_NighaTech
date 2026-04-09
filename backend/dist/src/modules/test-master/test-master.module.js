"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestMasterModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const test_master_schema_1 = require("./schemas/test-master.schema");
const test_master_service_1 = require("./test-master.service");
const test_master_controller_1 = require("./test-master.controller");
const auth_module_1 = require("../auth/auth.module");
let TestMasterModule = class TestMasterModule {
};
exports.TestMasterModule = TestMasterModule;
exports.TestMasterModule = TestMasterModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: test_master_schema_1.TestMaster.name, schema: test_master_schema_1.TestMasterSchema }]),
            auth_module_1.AuthModule,
        ],
        controllers: [test_master_controller_1.TestMasterController],
        providers: [test_master_service_1.TestMasterService],
        exports: [test_master_service_1.TestMasterService, mongoose_1.MongooseModule],
    })
], TestMasterModule);
//# sourceMappingURL=test-master.module.js.map