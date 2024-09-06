// litlab_back/routes/payment/payment.js

import express from "express";
// import { io } from "../server";

const router = express.Router();
export default router;

import validatePaymentRouter from "./endpoints/validate-payment.js"

router.use("", validatePaymentRouter);
