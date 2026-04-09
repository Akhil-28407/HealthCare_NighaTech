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
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const Handlebars = __importStar(require("handlebars"));
let PdfService = PdfService_1 = class PdfService {
    constructor() {
        this.logger = new common_1.Logger(PdfService_1.name);
    }
    getDefaultReportTemplate() {
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
    getDefaultInvoiceTemplate() {
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
    async generateLabReportPdf(report) {
        Handlebars.registerHelper('eq', (a, b) => a === b);
        const template = Handlebars.compile(this.getDefaultReportTemplate());
        const html = template({
            branch: report.branchId || { labName: 'Healthcare Lab', address: '', phone: '', email: '' },
            patient: report.clientId || {},
            reportNumber: report.reportNumber,
            orderNumber: report.testOrderId?.orderNumber || '',
            testName: report.testId?.name || 'Lab Test',
            results: report.results || [],
            qrCode: report.qrCode,
            enteredBy: report.enteredBy?.name || '',
            verifiedBy: report.verifiedBy?.name || '',
            reportDate: new Date(report.createdAt || Date.now()).toLocaleDateString(),
            generatedAt: new Date().toLocaleString(),
        });
        return this.htmlToPdf(html);
    }
    async generateInvoicePdf(invoice, type = 'INVOICE') {
        const template = Handlebars.compile(this.getDefaultInvoiceTemplate());
        const html = template({
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
        });
        return this.htmlToPdf(html);
    }
    async renderFromTemplate(templateContent, data) {
        const template = Handlebars.compile(templateContent);
        const html = template(data);
        return this.htmlToPdf(html);
    }
    async htmlToPdf(html) {
        let browser;
        try {
            const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
            if (isVercel) {
                const chromium = require('@sparticuz/chromium');
                const puppeteer = require('puppeteer-core');
                browser = await puppeteer.launch({
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath(),
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true,
                });
            }
            else {
                const puppeteer = require('puppeteer');
                browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                });
            }
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
            });
            return Buffer.from(pdf);
        }
        catch (error) {
            this.logger.error('PDF generation failed:', error);
            throw error;
        }
        finally {
            if (browser)
                await browser.close();
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map