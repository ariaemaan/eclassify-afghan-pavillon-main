'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMobileAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const MobileMoneyForm = ({ method, amount, currency, onSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate phone number format based on the payment method
    if (method === 'hesabpay' && !/^93[0-9]{9}$/.test(phoneNumber)) {
      toast.error('Please enter a valid Afghan phone number (e.g., 93712345678)');
      return;
    }

    if (method === 'mtn-momo' && !/^256[0-9]{9}$/.test(phoneNumber)) {
      toast.error('Please enter a valid MTN phone number (e.g., 256712345678)');
      return;
    }

    setIsProcessing(true);
    try {
      onSuccess(phoneNumber);
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodDetails = () => {
    switch (method) {
      case 'hesabpay':
        return {
          name: 'HesabPay',
          color: 'purple',
          placeholder: '93712345678',
          description: 'Enter your Afghan phone number',
        };
      case 'mtn-momo':
        return {
          name: 'MTN Mobile Money',
          color: 'yellow',
          placeholder: '256712345678',
          description: 'Enter your MTN phone number',
        };
      default:
        return {
          name: 'Mobile Money',
          color: 'blue',
          placeholder: 'Enter phone number',
          description: 'Enter your phone number',
        };
    }
  };

  const details = getMethodDetails();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <FaMobileAlt className={`text-${details.color}-600`} size={24} />
          <div>
            <h3 className="font-medium text-gray-900">{details.name}</h3>
            <p className="text-sm text-gray-500">{details.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={details.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            You will receive a payment request on your phone. Please confirm the payment to complete the transaction.
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={isProcessing}
        >
          Cancel
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={`flex-1 px-4 py-2 text-white bg-${details.color}-600 rounded-lg hover:bg-${details.color}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency || 'USD'
            }).format(amount)}`
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default MobileMoneyForm; 