import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { email, amount, currency = 'NGN' } = await request.json();

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        currency,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response.data;

    return NextResponse.json({
      reference: data.reference,
      authorizationUrl: data.authorization_url,
    });
  } catch (error) {
    console.error('Error creating Paystack transaction:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
} 