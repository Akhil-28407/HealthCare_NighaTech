import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load variables from .env
dotenv.config({ path: join(__dirname, '../.env') });

async function testConnection() {
  console.log('🔍 Testing SMTP Connection...');
  console.log('👤 User:', process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('⏳ Attempting to authenticate...');
    await transporter.verify();
    console.log('✅ SUCCESS: Connection verified! The credentials are correct.');
  } catch (error) {
    console.error('❌ FAILURE: Could not authenticate.');
    console.error('Error Details:', error.message);
    if (error.message.includes('535')) {
      console.log('\n💡 ADVICE: This is definitely a "Bad Credentials" error. This means:');
      console.log('1. The App Password might have a typo.');
      console.log('2. The password was generated for a different Gmail account.');
      console.log('3. 2-Step Verification might have been accidentally disabled.');
    }
  }
}

testConnection();
