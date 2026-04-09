import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void>;
    sendInvoice(to: string, name: string, invoiceNumber: string, viewUrl: string): Promise<void>;
    sendQuotation(to: string, name: string, quotationNumber: string, viewUrl: string): Promise<void>;
}
