import express from "express";
// import { io } from "../server";

const router = express.Router();
export default router;

import chatRouter from "./endpoints/chatgpt.js"
import dalleRouter from "./endpoints/dalle.js"


router.use("/chatgpt", chatRouter);
router.use("/dalle", dalleRouter);

