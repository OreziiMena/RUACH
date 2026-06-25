import { paystack } from '.';
import axios from 'axios';

interface CheckoutItemsParams {
  totalAmount: number;
  email: string;
  orderId: string;
}

const channels = [
  'card',
  'bank',
  'apple_pay',
  'ussd',
  'qr',
  'mobile_money',
  'bank_transfer',
  'eft',
  'capitec_pay',
  'payattitude',
];

const domain = process.env.ROOT_DOMAIN || 'http://localhost:3000';

function calculateGrossAmount(desiredNet: number) {
  const percentageFee = 0.015;
  const additionalFee = 100;
  const feeCap = 2000;

  let gross;

  // First estimate assuming additional fee applies
  gross = (desiredNet + additionalFee) / (1 - percentageFee);

  let fee = gross * percentageFee;

  if (gross > 2500) {
    fee += additionalFee;
  }

  fee = Math.min(fee, feeCap);

  gross = desiredNet + fee;

  return {
    netAmount: desiredNet,
    fee: Math.ceil(fee),
    grossAmount: Math.ceil(gross),
    paystackAmountKobo: Math.ceil(gross * 100),
  };
}

export const paystackCheckout = async ({
  totalAmount,
  email,
  orderId,
}: CheckoutItemsParams) => {
  const totalAmountInKobo = calculateGrossAmount(totalAmount).paystackAmountKobo;
  try {
    const checkout = await paystack.transaction.initialize({
      amount: totalAmountInKobo.toString(),
      email,
      channels,
      metadata: {
        orderId,
      },
      callback_url: `${domain}/orders/${orderId}`,
      currency: 'NGN',
    });

    if (!checkout.status || !checkout.data) {
      throw new Error('Paystack checkout initialization failed');
    }
    return checkout.data.authorization_url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data.message ||
            error.message ||
            'Paystack request failed'
      console.error('Paystack API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message,
      });
      throw Object.assign(new Error(message), { status: error.response?.status || 500 });
    }
  }
};
