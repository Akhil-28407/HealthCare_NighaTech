export declare class PdfService {
    private readonly logger;
    private getDefaultReportTemplate;
    private getDefaultInvoiceTemplate;
    generateLabReportPdf(report: any): Promise<Buffer>;
    generateInvoicePdf(invoice: any, type?: string): Promise<Buffer>;
    renderFromTemplate(templateContent: string, data: any): Promise<Buffer>;
    private htmlToPdf;
}
