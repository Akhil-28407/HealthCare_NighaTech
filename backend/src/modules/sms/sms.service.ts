import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendOtp(receiver: string, otp: string): Promise<boolean> {
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
            // Success response depends on the gateway, usually it's a success code or JSON
            // For now, we'll assume success if we get a 200 OK
            resolve(res.statusCode === 200);
          });
        })
        .on('error', (err) => {
          this.logger.error(`SMS Gateway Error for ${receiver}: ${err.message}`);
          resolve(false);
        });
    });
  }
}
