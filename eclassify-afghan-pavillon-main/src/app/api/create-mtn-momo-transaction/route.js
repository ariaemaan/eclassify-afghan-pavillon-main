import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { amount, currency = 'UGX', phoneNumber } = await request.json();

    const response = await axios.post(
      'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
      {
        amount: amount.toString(),
        currency,
        externalId: `eclassify-${Date.now()}`,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber,
        },
        payerMessage: 'Payment for E-Classify',
        payeeNote: 'Thank you for your payment',
      },
      {
        headers: {
          'X-Reference-Id': `eclassify-${Date.now()}`,
          'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY,
          'Authorization': `Bearer ${process.env.MTN_MOMO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      transactionId: response.headers['x-reference-id'],
      status: 'pending',
      message: 'Payment request sent to your phone',
    });
  } catch (error) {
    console.error('Error creating MTN Mobile Money transaction:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
} 