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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const https = require("https");
let SmsService = SmsService_1 = class SmsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SmsService_1.name);
    }
    async sendOtp(receiver, otp) {
        const config = this.configService.get('app.sms');
        const message = `Welcome to NighaTech Global Your OTP for authentication is ${otp} don't share with anybody Thank you`;
        const params = new URLSearchParams({
            secret: config.secret,
            sender: config.sender,
            tempid: config.tempid,
            receiver: receiver,
            route: config.route,
            msgtype: config.msgType,
            sms: message,
        });
        const url = `${config.baseUrl}?${params.toString()}`;
        return new Promise((resolve) => {
            https
                .get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    this.logger.log(`SMS Gateway Response for ${receiver}: ${data}`);
                    resolve(res.statusCode === 200);
                });
            })
                .on('error', (err) => {
                this.logger.error(`SMS Gateway Error for ${receiver}: ${err.message}`);
                resolve(false);
            });
        });
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map