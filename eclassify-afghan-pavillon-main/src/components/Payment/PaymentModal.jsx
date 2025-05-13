'use client';
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaMobileAlt } from 'react-icons/fa';
import { SiPaystack } from 'react-icons/si';
import { toast } from 'react-hot-toast';
import { paymentService } from '@/services/paymentService';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CardPaymentForm from './CardPaymentForm';
import MobileMoneyForm from './MobileMoneyForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PaymentModal = ({ isOpen, onClose, amount, currency, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(async (method, phoneNumber) => {
    try {
      setIsProcessing(true);
      let result;

      switch (method) {
        case 'card':
          // Card payment is handled by CardPaymentForm component
          return;
        case 'paypal':
          result = await paymentService.processPayPalPayment(amount, currency);
          if (result?.approvalUrl) {
            window.location.href = result.approvalUrl;
          }
          break;
        case 'paystack':
          result = await paymentService.processPaystackPayment(
            'customer@example.com', // Replace with actual customer email
            amount,
            currency
          );
          if (result?.authorizationUrl) {
            window.location.href = result.authorizationUrl;
          }
          break;
        case 'hesabpay':
          result = await paymentService.processHesabPayPayment(
            amount,
            currency,
            phoneNumber
          );
          if (result?.paymentUrl) {
            window.location.href = result.paymentUrl;
          }
          break;
        case 'mtn-momo':
          result = await paymentService.processMTNMoMoPayment(
            amount,
            currency,
            phoneNumber
          );
          toast.success(result.message);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      onSuccess(result);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [amount, currency, onSuccess, onClose]);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit Card',
      icon: <FaCreditCard className="text-blue-500" size={24} />,
      description: 'Pay securely with your credit card',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <FaPaypal className="text-blue-600" size={24} />,
      description: 'Pay with your PayPal account',
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: <SiPaystack className="text-green-600" size={24} />,
      description: 'Pay with Paystack',
    },
    {
      id: 'hesabpay',
      name: 'HesabPay',
      icon: <FaMobileAlt className="text-purple-600" size={24} />,
      description: 'Pay with HesabPay mobile money',
    },
    {
      id: 'mtn-momo',
      name: 'MTN Mobile Money',
      icon: <FaMobileAlt className="text-yellow-600" size={24} />,
      description: 'Pay with MTN Mobile Money',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Payment</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">Amount to pay:</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency || 'USD'
                }).format(amount)}
              </p>
            </div>

            {selectedMethod === 'card' ? (
              <Elements stripe={stripePromise}>
                <CardPaymentForm
                  amount={amount}
                  currency={currency}
                  onSuccess={onSuccess}
                  onCancel={() => setSelectedMethod(null)}
                />
              </Elements>
            ) : selectedMethod === 'hesabpay' || selectedMethod === 'mtn-momo' ? (
              <MobileMoneyForm
                method={selectedMethod}
                amount={amount}
                currency={currency}
                onSuccess={(phoneNumber) => handlePayment(selectedMethod, phoneNumber)}
                onCancel={() => setSelectedMethod(null)}
              />
            ) : (
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 border rounded-lg hover:border-blue-500 transition-colors flex items-center space-x-4"
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={isProcessing}
                  >
                    {method.icon}
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {isProcessing && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Processing payment...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal; 