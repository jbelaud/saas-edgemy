import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const subscriberSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  role: z.enum(["PLAYER", "COACH"], {
    message: "Veuillez sélectionner votre rôle",
  }),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Subscribe Simple API called');
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate the input
    const validatedData = subscriberSchema.parse(body);
    console.log('Data validated:', validatedData);

    // Check if email already exists
    console.log('Checking for existing subscriber...');
    const existingSubscriber = await db.subscriber.findUnique({
      where: { email: validatedData.email }
    });
    console.log('Existing subscriber:', existingSubscriber);

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Create new subscriber
    console.log('Creating new subscriber...');
    const subscriber = await db.subscriber.create({
      data: {
        email: validatedData.email,
        role: validatedData.role,
      },
    });
    console.log('Subscriber created:', subscriber);

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
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
