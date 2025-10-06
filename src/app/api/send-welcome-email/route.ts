import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/brevo';

const emailSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  firstName: z.string().optional(),
  role: z.enum(["PLAYER", "COACH"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = emailSchema.parse(body);

    // Vérifier si les variables d'environnement sont configurées
    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      );
    }

    const result = await sendWelcomeEmail({
      email: validatedData.email,
      firstName: validatedData.firstName,
      role: validatedData.role
    });

    if (result.success) {
      return NextResponse.json({ message: 'Email sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send email error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
