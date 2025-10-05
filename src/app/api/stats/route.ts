import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const subscriberCount = await db.subscriber.count();
    
    return NextResponse.json({ 
      subscriberCount,
      success: true 
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        subscriberCount: 0,
        success: false,
        error: 'Failed to fetch stats' 
      },
      { status: 500 }
    );
  }
}
