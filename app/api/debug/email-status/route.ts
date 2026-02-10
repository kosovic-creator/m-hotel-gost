import { NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT - Informacije o email konfiguraciji
 * Korištenje: GET /api/debug/email-status
 */
export async function GET() {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailFrom = process.env.EMAIL_FROM;

  const isConfigured = !!(emailUser && emailPassword);

  return NextResponse.json({
    status: isConfigured ? '✓ KONFIGURISAN' : '✗ NIJE KONFIGURISAN',
    emailHost: emailHost || 'nije postavljen',
    emailPort: emailPort || 'nije postavljen',
    emailUser: emailUser ? '✓ Postavljeno' : '✗ TREBATE POSTAVITI EMAIL_USER',
    emailPassword: emailPassword ? '✓ Postavljeno' : '✗ TREBATE POSTAVITI EMAIL_PASSWORD',
    emailFrom: emailFrom || 'nije postavljen (koristiće EMAIL_USER)',
    configuration_complete: isConfigured,
    instructions: isConfigured
      ? 'Email je konfiguriran. Trebao bi da radi!'
      : 'Trebate postaviti EMAIL_USER i EMAIL_PASSWORD u .env.local datoteci',
    example_env: {
      EMAIL_HOST: 'smtp.gmail.com',
      EMAIL_PORT: 587,
      EMAIL_SECURE: false,
      EMAIL_USER: 'vasa-email@gmail.com',
      EMAIL_PASSWORD: 'xxxxx xxxx xxxx xxxx (App Password za Gmail)',
      EMAIL_FROM: 'vasa-email@gmail.com'
    }
  });
}
