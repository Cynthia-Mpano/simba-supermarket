import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database (PostgreSQL via Supabase or self-hosted)
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/simba_db',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS – your Next.js frontend URL
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // MTN Mobile Money (Rwanda)
  MTN_MOMO_BASE_URL: process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
  MTN_MOMO_PRIMARY_KEY: process.env.MTN_MOMO_PRIMARY_KEY || '',
  MTN_MOMO_API_USER: process.env.MTN_MOMO_API_USER || '',
  MTN_MOMO_API_KEY: process.env.MTN_MOMO_API_KEY || '',
  MTN_MOMO_ENVIRONMENT: process.env.MTN_MOMO_ENVIRONMENT || 'sandbox', // or 'production'
  MTN_MOMO_CURRENCY: 'RWF',
  MTN_MOMO_CALLBACK_URL: process.env.MTN_MOMO_CALLBACK_URL || 'http://localhost:4000/api/orders/momo-callback',

  // Airtel Money (Rwanda)
  AIRTEL_CLIENT_ID: process.env.AIRTEL_CLIENT_ID || '',
  AIRTEL_CLIENT_SECRET: process.env.AIRTEL_CLIENT_SECRET || '',
  AIRTEL_BASE_URL: process.env.AIRTEL_BASE_URL || 'https://openapi.airtel.africa',
  AIRTEL_ENVIRONMENT: process.env.AIRTEL_ENVIRONMENT || 'sandbox', // or 'production'

  // Email (Resend / SendGrid / SMTP)
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'resend', // 'resend' | 'smtp'
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@simbasupermarket.rw',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  // SMS (Africa's Talking – popular in Rwanda)
  AT_API_KEY: process.env.AT_API_KEY || '',
  AT_USERNAME: process.env.AT_USERNAME || 'sandbox',
  AT_SENDER_ID: process.env.AT_SENDER_ID || 'SIMBA',

  // Delivery
  FREE_DELIVERY_THRESHOLD: 50000, // RWF
  DELIVERY_FEE: 2000,             // RWF
};
