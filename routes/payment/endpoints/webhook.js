import { Router } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import express from 'express';
import { updatePurchaseState } from '../../../controllers/purchaseController.js';

dotenv.config();

const router = Router();
const stripe = new Stripe(process.env.STRIPE_API_KEY);

// Utilizar express.raw() para manejar el cuerpo en bruto
router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Construir el evento usando el cuerpo en bruto
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento según su tipo
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session);
  
      // Access metadata
      const purchaseId = session.metadata.purchaseId;
      

      
      // Use the metadata as needed, for example:
      // const purchaseId = metadata.purchaseId;
      updatePurchaseState({ params: { purchaseId } });
  
      break;
    // Handle other event types if necessary
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  

  // Confirmar la recepción del evento con una respuesta 200
  res.json({ received: true });
});

export default router;
