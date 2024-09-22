import { Router } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { FRONTEND_URL } from '../../../CONSTS.js';
import express from 'express';



dotenv.config();

const router = Router();
const stripe = new Stripe(process.env.STRIPE_API_KEY);


router.post('/create-checkout-session', async (req, res) => {
  const { price, url, purchaseId } = req.body;

  const priceInCents = parseFloat(price) * 100;
  if (isNaN(priceInCents) || priceInCents <= 0) {
    return res.status(400).json({ error: 'Invalid price value' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Stubborn Attachments',
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        purchaseId: purchaseId
      },
      success_url: `${FRONTEND_URL}${url}&payment=true&purchaseId=${purchaseId}`,
      cancel_url: `${FRONTEND_URL}${url}&payment=false`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
