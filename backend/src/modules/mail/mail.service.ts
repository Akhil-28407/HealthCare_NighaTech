import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const user = this.configService.get('app.smtp.user');
    const pass = this.configService.get('app.smtp.pass');
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }

  async onModuleInit() {
    this.logger.log(`🧪 Testing SMTP connection for: ${this.configService.get('app.smtp.user')}...`);
    try {
      await this.transporter.verify();
      this.logger.log('✅ SMTP Connection established successfully!');
    } catch (error) {
      this.logger.error(`❌ SMTP Connection failed: ${error.message}`);
      this.logger.warn('💡 Tip: Ensure you are using a 16-character Google App Password (no spaces).');
    }
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
  
  async sendLabReport(to: string, name: string, reportNumber: string, pdfBuffer: Buffer) {
    try {
      await this.transporter.sendMail({
        from: `"Healthcare Lab" <${this.configService.get('app.smtp.user')}>`,
        to,
        subject: `Medical Report - ${reportNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f766e;">Medical Test Report</h2>
            <p>Hello ${name},</p>
            <p>Your medical test report (${reportNumber}) is ready. Please find the attached PDF document.</p>
            <p>If you have any questions regarding your results, please contact our laboratory.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>Healthcare Lab Team</strong></p>
          </div>
        `,
        attachments: [
          {
            filename: `report-${reportNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
      this.logger.log(`Report email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send report email to ${to}:`, error.message);
    }
  }
}
