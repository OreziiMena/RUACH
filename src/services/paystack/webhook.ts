import { prisma } from '@/lib/prisma';
import OrderService from '@/services/order.service';
import {
  ChargeSuccessData,
  PaystackWebhookEvent,
} from './types';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

// ─── Signature Verification ───────────────────────────────────────────────────
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) {
    console.warn('Paystack webhook signature missing');
    return false;
  }

  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  return hash === signature;
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleChargeSuccess(data: ChargeSuccessData): Promise<void> {
  const orderId = data.metadata?.orderId;

  if (!orderId) {
    console.warn('Paystack charge.success missing orderId', {
      transactionId: data.id,
    });
    throw {
      message: 'Order not found',
      status: 400,
    };
  }

  console.info('Processing Paystack charge.success', {
    transactionId: data.id,
    orderId,
  });

  await OrderService.processPaidOrder(orderId);
  console.info('Paystack charge.success completed', {
    transactionId: data.id,
    orderId,
  });
}

export const paystackWebhookHandler = async (body: PaystackWebhookEvent) => {
  console.info('Handling Paystack webhook event', {
    eventId: body.data.id,
    eventType: body.event,
  });

  // check if event has been processed before
  const existingEvent = await prisma.paystackEvent.findUnique({
    where: { event_id: body.data.id.toString() },
  });
  if (existingEvent) {
    console.log('Paystack event already processed', {
      eventId: body.data.id,
      eventType: body.event,
    });
    return;
  }

  // store the event
  await prisma.paystackEvent.create({
    data: {
      event_id: body.data.id.toString(),
      event_type: body.event,
      payload: body.data as unknown as Prisma.InputJsonValue,
      received_at: new Date(),
    },
  });

  console.info('Paystack event stored', {
    eventId: body.data.id,
    eventType: body.event,
  });

  switch (body.event) {
    case 'charge.success':
      return handleChargeSuccess(body.data as ChargeSuccessData);
    default:
      console.warn('Unhandled Paystack event type', {
        eventId: body.data.id,
        eventType: body.event,
      });
  }
};
