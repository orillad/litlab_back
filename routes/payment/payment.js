// litlab_back/routes/payment/payment.js

import express from "express";
// import { io } from "../server";

const router = express.Router();
export default router;

import validatePaymentRouter from "./endpoints/validate-payment-access.js"
import checkoutPaymentRouter from "./endpoints/checkout.js"
// import webhookRouter from "./endpoints/webhook.js"

router.use("", validatePaymentRouter);
router.use("", checkoutPaymentRouter);
// router.use("/webhook", webhookRouter);
