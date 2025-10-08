import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/brevo';

export async function GET() {
  try {
    console.log('Testing email sending...');
    
    const result = await sendWelcomeEmail({
      email: 'olive.belaud@gmail.com', // Changez par votre email pour tester
      firstName: 'Test',
      role: 'PLAYER'
    });

    return NextResponse.json({
      message: 'Email test completed',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        fullError: JSON.stringify(error, null, 2)
      },
      { status: 500 }
    );
  }
}
