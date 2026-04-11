import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as Handlebars from 'handlebars';
import { ReportTemplate, ReportTemplateDocument } from '../templates/schemas/report-template.schema';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(
    @InjectModel(ReportTemplate.name) private templateModel: Model<ReportTemplateDocument>,
  ) {
    // Register helpers once
    if (!Handlebars.helpers.eq) {
      Handlebars.registerHelper('eq', (a, b) => a === b);
    }
  }

  private getDefaultReportTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1a1a2e; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f766e; padding-bottom: 15px; margin-bottom: 15px; }
    .lab-info h1 { color: #0f766e; font-size: 22px; }
    .lab-info p { color: #555; font-size: 11px; }
    .qr-section { text-align: center; }
    .qr-section img { width: 80px; height: 80px; }
    .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f0fdfa; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
    .patient-info div { font-size: 11px; }
    .patient-info strong { color: #0f766e; }
    .report-title { text-align: center; font-size: 16px; color: #0f766e; margin: 15px 0; font-weight: 700; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #0f766e; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) { background: #f9fafb; }
    .flag-H { color: #dc2626; font-weight: 700; }
    .flag-L { color: #2563eb; font-weight: 700; }
    .flag-N { color: #16a34a; }
    .footer { margin-top: 30px; border-top: 2px solid #e5e7eb; padding-top: 15px; display: flex; justify-content: space-between; }
    .signature { text-align: center; }
    .signature .line { width: 150px; border-top: 1px solid #333; margin: 30px auto 5px; }
    .timestamp { text-align: center; color: #888; font-size: 10px; margin-top: 15px; }
    .html-content { margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="lab-info">
      <h1>{{branch.labName}}</h1>
      <p>{{branch.address}}</p>
      <p>Phone: {{branch.phone}} | Email: {{branch.email}}</p>
      {{#if branch.labLicense}}<p>License: {{branch.labLicense}}</p>{{/if}}
    </div>
    {{#if qrCode}}
    <div class="qr-section">
      <img src="{{qrCode}}" alt="QR Code" />
      <p style="font-size:9px;">Scan to verify</p>
    </div>
    {{/if}}
  </div>

  <div class="patient-info">
    <div><strong>Patient:</strong> {{patient.name}}</div>
    <div><strong>Report #:</strong> {{reportNumber}}</div>
    <div><strong>Age/Gender:</strong> {{patient.age}} / {{patient.gender}}</div>
    <div><strong>Order #:</strong> {{orderNumber}}</div>
    <div><strong>Mobile:</strong> {{patient.mobile}}</div>
    <div><strong>Date:</strong> {{reportDate}}</div>
  </div>

  <div class="report-title">{{testName}} - Test Report</div>

  {{#if results.length}}
  <table>
    <thead>
      <tr>
        <th>Parameter</th>
        <th>Result</th>
        <th>Unit</th>
        <th>Reference Range</th>
        <th>Flag</th>
      </tr>
    </thead>
    <tbody>
      {{#each results}}
      <tr>
        <td>{{this.name}}</td>
        <td><strong>{{this.value}}</strong></td>
        <td>{{this.unit}}</td>
        <td>{{#if this.normalRangeText}}{{this.normalRangeText}}{{else}}{{this.normalRangeMin}} - {{this.normalRangeMax}}{{/if}}</td>
        <td class="flag-{{this.flag}}">
          {{#if (eq this.flag "H")}}↑ High{{/if}}
          {{#if (eq this.flag "L")}}↓ Low{{/if}}
          {{#if (eq this.flag "N")}}Normal{{/if}}
        </td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  {{#if htmlContent}}
  <div class="html-content">
    {{{htmlContent}}}
  </div>
  {{/if}}

  <div class="footer">
    <div class="signature">
      <div class="line"></div>
      <strong>Lab Technician</strong>
      {{#if enteredBy}}<p>{{enteredBy}}</p>{{/if}}
    </div>
    <div class="signature">
      <div class="line"></div>
      <strong>Pathologist</strong>
      {{#if verifiedBy}}<p>{{verifiedBy}}</p>{{/if}}
    </div>
  </div>

  <div class="timestamp">
    Generated on {{generatedAt}} | This is a computer-generated report
  </div>
</body>
</html>`;
  }

  private getDefaultInvoiceTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1a1a2e; }
    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 20px; }
    .company h1 { color: #0f766e; font-size: 24px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { color: #0f766e; font-size: 28px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 25px; }
    .party { width: 45%; }
    .party h3 { color: #0f766e; margin-bottom: 8px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0f766e; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .totals { text-align: right; margin-top: 20px; }
    .totals div { margin: 5px 0; font-size: 14px; }
    .totals .grand-total { font-size: 18px; font-weight: 700; color: #0f766e; border-top: 2px solid #0f766e; padding-top: 10px; }
    .footer { margin-top: 40px; text-align: center; color: #888; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>{{branch.labName}}</h1>
      <p>{{branch.address}}</p>
      <p>{{branch.phone}} | {{branch.email}}</p>
    </div>
    <div class="invoice-meta">
      <h2>{{title}}</h2>
      <p><strong>Number:</strong> {{number}}</p>
      <p><strong>Date:</strong> {{date}}</p>
      {{#if dueDate}}<p><strong>Due:</strong> {{dueDate}}</p>{{/if}}
      <p><strong>Status:</strong> {{status}}</p>
    </div>
  </div>
  <div class="parties">
    <div class="party">
      <h3>Bill To:</h3>
      <p><strong>{{client.name}}</strong></p>
      <p>{{client.email}}</p>
      <p>{{client.mobile}}</p>
      {{#if client.address}}<p>{{client.address}}</p>{{/if}}
    </div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
    <tbody>
      {{#each items}}
      <tr><td>{{@index}}</td><td>{{this.name}}</td><td>{{this.quantity}}</td><td>₹{{this.unitPrice}}</td><td>₹{{this.amount}}</td></tr>
      {{/each}}
    </tbody>
  </table>
  <div class="totals">
    <div>Subtotal: ₹{{subtotal}}</div>
    {{#if tax}}<div>Tax: ₹{{tax}}</div>{{/if}}
    {{#if discount}}<div>Discount: -₹{{discount}}</div>{{/if}}
    <div class="grand-total">Total: ₹{{total}}</div>
  </div>
  <div class="footer">
    <p>Thank you for choosing our services.</p>
    <p>Generated on {{generatedAt}}</p>
  </div>
</body>
</html>`;
  }

  async generateLabReportPdf(report: any): Promise<Buffer> {

    // Try to find branch-specific lab_report template
    const branchTemplate = await this.templateModel.findOne({
      branchId: report.branchId?._id || report.branchId,
      type: 'lab_report',
      isActive: true,
    }).lean();

    const data = {
      branch: report.branchId || { labName: 'Healthcare Lab', address: '', phone: '', email: '' },
      patient: report.clientId || {},
      reportNumber: report.reportNumber,
      orderNumber: report.testOrderId?.orderNumber || '',
      testName: report.testId?.name || 'Lab Test',
      results: report.results || [],
      htmlContent: report.htmlContent || '',
      qrCode: report.qrCode,
      enteredBy: report.enteredBy?.name || '',
      verifiedBy: report.verifiedBy?.name || '',
      reportDate: new Date(report.createdAt || Date.now()).toLocaleDateString(),
      generatedAt: new Date().toLocaleString(),
    };

    if (branchTemplate) {
      return this.renderFromTemplate(branchTemplate.content, data);
    }

    const template = Handlebars.compile(this.getDefaultReportTemplate());
    const html = template(data);
    return this.htmlToPdf(html);
  }

  async generateInvoicePdf(invoice: any, type = 'INVOICE'): Promise<Buffer> {
    // Try to find branch-specific template for invoice/quotation
    const branchTemplate = await this.templateModel.findOne({
      branchId: invoice.branchId?._id || invoice.branchId,
      type: type.toLowerCase(),
      isActive: true,
    }).lean();

    const data = {
      title: type,
      branch: invoice.branchId || { labName: 'Healthcare Lab' },
      client: invoice.clientId || {},
      number: invoice.invoiceNumber || invoice.quotationNumber,
      date: new Date(invoice.createdAt || Date.now()).toLocaleDateString(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '',
      status: invoice.status,
      items: invoice.items || [],
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      discount: invoice.discount,
      total: invoice.total,
      generatedAt: new Date().toLocaleString(),
    };

    if (branchTemplate) {
      return this.renderFromTemplate(branchTemplate.content, data);
    }

    const template = Handlebars.compile(this.getDefaultInvoiceTemplate());
    const html = template(data);
    return this.htmlToPdf(html);
  }

  async renderFromTemplate(templateContent: string, data: any): Promise<Buffer> {
    const template = Handlebars.compile(templateContent);
    const html = template(data);
    return this.htmlToPdf(html);
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    let browser;
    try {
      const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
      
      if (isVercel) {
        this.logger.log('📦 Launching serverless Chromium (Vercel)...');
        try {
          const chromium = require('@sparticuz/chromium');
          const puppeteer = require('puppeteer-core');
          
          browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
          });
        } catch (e) {
          this.logger.error('❌ Failed to load serverless Chromium:', e.message);
          throw new Error(`Serverless PDF launch failed: ${e.message}`);
        }
      } else {
        try {
          this.logger.log('🚀 Launching local browser for PDF generation...');
          let puppeteer;
          try {
            // Prefer puppeteer-core for manual executable paths to avoid binary conflicts
            puppeteer = require('puppeteer-core');
          } catch {
            puppeteer = require('puppeteer');
          }

          browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (() => {
              const chromePaths = [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser'
              ];
              const fs = require('fs');
              for (const path of chromePaths) {
                if (fs.existsSync(path)) {
                  // Reduced logging for cleaner production output
                  return path;
                }
              }
              return undefined;
            })(),
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--font-render-hinting=none',
              '--remote-debugging-port=9222',
            ],
            timeout: 60000,
            ignoreHTTPSErrors: true,
          });
        } catch (e) {
          this.logger.error('❌ Browser launch failed:', e.stack);
          throw new Error(`PDF Engine Error: ${e.message}. Please ensure Google Chrome or Brave is installed.`);
        }
      }

      const page = await browser.newPage();
      // Use 'load' instead of 'networkidle0' to prevent timeouts on external assets like fonts
      await page.setContent(html, { 
        waitUntil: 'load',
        timeout: 60000 
      });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });
      return Buffer.from(pdf);
    } catch (error) {
      this.logger.error('PDF generation failed:', error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }
}
