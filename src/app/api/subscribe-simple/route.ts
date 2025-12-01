import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { applyRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const subscriberSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  role: z.enum(["PLAYER", "COACH"], {
    message: "Veuillez sélectionner votre rôle",
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 req/min par IP
    const rateLimitResponse = await applyRateLimit(request, 'public');
    if (rateLimitResponse) return rateLimitResponse;

    logger.debug('Subscribe Simple API called');
    const body = await request.json();
    logger.debug('Request body:', body);
    
    // Validate the input
    const validatedData = subscriberSchema.parse(body);
    logger.debug('Data validated:', validatedData);

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
        role: validatedData.role,
      },
    });
    logger.debug('Subscriber created:', subscriber.id);

    return NextResponse.json(
      { message: 'Inscription réussie', id: subscriber.id },
      { status: 201 }
    );

  } catch (error) {
    logger.error('Subscription error:', error);
    
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
