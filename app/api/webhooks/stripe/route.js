import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import redis from '@/lib/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// SpreadAPI product IDs from Stripe Dashboard
const SPREADAPI_PRODUCTS = {
  'prod_TsLTrY3A4G3Tyx': 'pro',
  'prod_TsLUOejOvHRir7': 'premium',
};

/**
 * Find user by email in Redis
 * Scans user hashes to find matching email
 */
async function findUserByEmail(email) {
  if (!email) return null;

  const normalizedEmail = email.toLowerCase();

  // Scan for user keys
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      MATCH: 'user:*',
      COUNT: 100,
    });
    cursor = nextCursor;

    // Filter out index keys (user:xxx:services, etc.)
    const userKeys = keys.filter(k => !k.includes(':services') && !k.includes(':activity'));

    for (const key of userKeys) {
      const userData = await redis.hGetAll(key);
      if (userData.email?.toLowerCase() === normalizedEmail) {
        return { id: key.replace('user:', ''), ...userData };
      }
    }
  } while (cursor !== '0');

  return null;
}

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  // Verify webhook signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_SPREADAPI_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe SpreadAPI Webhook] Received event: ${event.type}`);

  // Handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Get line items to find the product
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceData = lineItems.data[0]?.price;
      const productId = typeof priceData?.product === 'string'
        ? priceData.product
        : priceData?.product?.id;

      console.log(`[Stripe SpreadAPI Webhook] Product ID: ${productId}`);

      // Check if it's a SpreadAPI product
      const licenseType = SPREADAPI_PRODUCTS[productId];

      if (!licenseType) {
        console.log(`[Stripe SpreadAPI Webhook] Unknown product: ${productId}, ignoring`);
        return NextResponse.json({ received: true, ignored: true });
      }

      // Get customer email
      const email = session.customer_details?.email;
      if (!email) {
        console.error('[Stripe SpreadAPI Webhook] No customer email in session');
        return NextResponse.json({ error: 'No customer email' }, { status: 400 });
      }

      console.log(`[Stripe SpreadAPI Webhook] Processing ${licenseType} purchase for ${email}`);

      // Find user by email
      const user = await findUserByEmail(email);

      if (!user) {
        console.error(`[Stripe SpreadAPI Webhook] User not found for email: ${email}`);
        // Store for later reconciliation
        await redis.hSet('stripe:pending-upgrades', email, JSON.stringify({
          licenseType,
          productId,
          sessionId: session.id,
          customerId: session.customer,
          timestamp: new Date().toISOString(),
        }));
        return NextResponse.json({ received: true, pending: true });
      }

      // Update user's license type
      await redis.hSet(`user:${user.id}`, {
        licenseType,
        stripeCustomerId: session.customer || '',
        stripeSessionId: session.id,
        licenseUpdatedAt: new Date().toISOString(),
      });

      console.log(`[Stripe SpreadAPI Webhook] Updated user ${user.id} to ${licenseType}`);

      return NextResponse.json({
        received: true,
        userId: user.id,
        licenseType,
      });

    } catch (err) {
      console.error('[Stripe SpreadAPI Webhook] Error processing checkout:', err);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  // Handle subscription updates (for recurring billing)
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;

    // Check if subscription was cancelled or expired
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      const customerId = subscription.customer;

      // Find user by Stripe customer ID
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          MATCH: 'user:*',
          COUNT: 100,
        });
        cursor = nextCursor;

        const userKeys = keys.filter(k => !k.includes(':services') && !k.includes(':activity'));

        for (const key of userKeys) {
          const userData = await redis.hGetAll(key);
          if (userData.stripeCustomerId === customerId) {
            // Downgrade to free
            await redis.hSet(key, {
              licenseType: 'free',
              licenseUpdatedAt: new Date().toISOString(),
            });
            console.log(`[Stripe SpreadAPI Webhook] Downgraded ${key} to free (subscription ${subscription.status})`);
            break;
          }
        }
      } while (cursor !== '0');
    }
  }

  return NextResponse.json({ received: true });
}
