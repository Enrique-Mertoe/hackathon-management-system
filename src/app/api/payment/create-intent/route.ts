import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase.server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser(await supabase())
    
    if (!user || !auth.hasRole(user, 'ORGANIZER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Organizer role required' },
        { status: 403 }
      )
    }

    const { amount, hackathonTitle, prizePool } = await request.json()

    // Validate amount (should be 10% of prize pool in cents)
    const expectedAmount = Math.round(prizePool * 0.1 * 100)
    if (amount !== expectedAmount) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        hackathonTitle,
        prizePool: prizePool.toString(),
        platformFee: (prizePool * 0.1).toString(),
        organizerId: user.id,
        organizerEmail: user.email,
      },
      description: `Platform fee for publishing hackathon: ${hackathonTitle}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}