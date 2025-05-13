import axios from 'axios';

class PaymentService {
  constructor() {
    this.stripe = null;
    this.paypal = null;
    this.initializeStripe();
  }

  async initializeStripe() {
    if (typeof window !== 'undefined') {
      const stripe = await import('@stripe/stripe-js');
      this.stripe = await stripe.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
  }

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const response = await axios.post('/api/create-payment-intent', {
        amount,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async processStripePayment(paymentMethodId, amount) {
    try {
      const { clientSecret } = await this.createPaymentIntent(amount);
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (error) {
        throw new Error(error.message);
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw error;
    }
  }

  async processPayPalPayment(amount, currency = 'USD') {
    try {
      const response = await axios.post('/api/create-paypal-order', {
        amount,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      throw error;
    }
  }

  async processPaystackPayment(email, amount, currency = 'NGN') {
    try {
      const response = await axios.post('/api/create-paystack-transaction', {
        email,
        amount,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing Paystack payment:', error);
      throw error;
    }
  }

  async processHesabPayPayment(amount, currency = 'AFN', phoneNumber) {
    try {
      const response = await axios.post('/api/create-hesabpay-transaction', {
        amount,
        currency,
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing HesabPay payment:', error);
      throw error;
    }
  }

  async processMTNMoMoPayment(amount, currency = 'UGX', phoneNumber) {
    try {
      const response = await axios.post('/api/create-mtn-momo-transaction', {
        amount,
        currency,
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing MTN Mobile Money payment:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId, provider) {
    try {
      const response = await axios.post('/api/verify-payment', {
        paymentId,
        provider,
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService(); 