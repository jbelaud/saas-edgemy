import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { sendWelcomeEmail, sendInternalNotification } from '@/lib/brevo';

const subscriberSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  firstName: z.string().optional(),
  role: z.enum(["PLAYER", "COACH"], {
    message: "Veuillez sélectionner votre rôle",
  }),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Subscribe API called');
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate the input
    const validatedData = subscriberSchema.parse(body);
    console.log('Data validated:', validatedData);

    // Check if email already exists
    const existingSubscriber = await db.subscriber.findUnique({
      where: { email: validatedData.email }
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Create new subscriber
    const subscriber = await db.subscriber.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        role: validatedData.role,
      },
    });

    // Send welcome email (temporarily disabled for debugging)
    console.log('Subscriber created successfully, attempting to send emails...');
    try {
      console.log('Calling sendWelcomeEmail...');
      const emailResult = await sendWelcomeEmail({
        email: validatedData.email,
        firstName: validatedData.firstName,
        role: validatedData.role
      });
      console.log('Email result:', emailResult);
      
      console.log('Calling sendInternalNotification...');
      await sendInternalNotification('subscriber', validatedData);
      console.log('Internal notification sent');
      
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Continue even if email fails - don't block the subscription
    }

    return NextResponse.json(
      { message: 'Inscription réussie', id: subscriber.id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Subscription error:', error);
    
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
