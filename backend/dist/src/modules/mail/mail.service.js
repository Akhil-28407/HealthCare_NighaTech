"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('app.smtp.host'),
            port: this.configService.get('app.smtp.port'),
            secure: false,
            auth: {
                user: this.configService.get('app.smtp.user'),
                pass: this.configService.get('app.smtp.pass'),
            },
        });
    }
    async sendPasswordReset(to, name, resetUrl) {
        try {
            await this.transporter.sendMail({
                from: `"Healthcare Lab" <${this.configService.get('app.smtp.user')}>`,
                to,
                subject: 'Password Reset Request',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f766e;">Password Reset</h2>
            <p>Hello ${name},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Reset Password
            </a>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
            });
            this.logger.log(`Password reset email sent to ${to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error.message);
        }
    }
    async sendInvoice(to, name, invoiceNumber, viewUrl) {
        try {
            await this.transporter.sendMail({
                from: `"Healthcare Lab" <${this.configService.get('app.smtp.user')}>`,
                to,
                subject: `Invoice ${invoiceNumber}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f766e;">Invoice ${invoiceNumber}</h2>
            <p>Hello ${name},</p>
            <p>Your invoice is ready. Click below to view:</p>
            <a href="${viewUrl}" style="display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              View Invoice
            </a>
          </div>
        `,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send invoice email:`, error.message);
        }
    }
    async sendQuotation(to, name, quotationNumber, viewUrl) {
        try {
            await this.transporter.sendMail({
                from: `"Healthcare Lab" <${this.configService.get('app.smtp.user')}>`,
                to,
                subject: `Quotation ${quotationNumber}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f766e;">Quotation ${quotationNumber}</h2>
            <p>Hello ${name},</p>
            <p>Your quotation is ready. Click below to view:</p>
            <a href="${viewUrl}" style="display: inline-block; padding: 12px 24px; background: #0f766e; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              View Quotation
            </a>
          </div>
        `,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send quotation email:`, error.message);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map