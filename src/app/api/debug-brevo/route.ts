import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = {
      hasApiKey: !!process.env.BREVO_API_KEY,
      apiKeyLength: process.env.BREVO_API_KEY?.length || 0,
      senderName: process.env.BREVO_SENDER_NAME || 'NOT_SET',
      senderEmail: process.env.BREVO_SENDER_EMAIL || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      message: 'Brevo configuration check',
      config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Debug failed', details: error },
      { status: 500 }
    );
  }
}
