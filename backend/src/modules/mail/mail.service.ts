import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
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
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
    }
  }

  async sendInvoice(to: string, name: string, invoiceNumber: string, viewUrl: string) {
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
    } catch (error) {
      this.logger.error(`Failed to send invoice email:`, error.message);
    }
  }

  async sendQuotation(to: string, name: string, quotationNumber: string, viewUrl: string) {
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
    } catch (error) {
      this.logger.error(`Failed to send quotation email:`, error.message);
    }
  }
}
