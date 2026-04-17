import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare',
  jwt: {
    secret: process.env.JWT_SECRET || 'healthcare-dev-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  sms: {
    baseUrl: process.env.SMS_BASE_URL || 'https://43.252.88.250/index.php/smsapi/httpapi/',
    secret: process.env.SMS_SECRET || 'xledocqmXkNPrTesuqWr',
    sender: process.env.SMS_SENDER || 'NIGHAI',
    tempid: process.env.SMS_TEMP_ID || '1207174264191607433',
    route: process.env.SMS_ROUTE || 'TA',
    msgType: process.env.SMS_MSG_TYPE || '1',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
  },
}));
