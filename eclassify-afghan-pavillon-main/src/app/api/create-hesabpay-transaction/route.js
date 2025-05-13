import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { amount, currency = 'AFN', phoneNumber } = await request.json();

    const response = await axios.post(
      'https://api.hesabpay.com/v1/transactions',
      {
        amount: Math.round(amount * 100), // Convert to smallest currency unit
        currency,
        phoneNumber,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/verify`,
        metadata: {
          source: 'eclassify',
          environment: process.env.NODE_ENV,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HESABPAY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response.data;

    return NextResponse.json({
      transactionId: data.id,
      status: data.status,
      paymentUrl: data.payment_url,
    });
  } catch (error) {
    console.error('Error creating HesabPay transaction:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
} 