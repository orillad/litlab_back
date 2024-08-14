// litlab_back/routes/gpt/gpt.js

import express from "express";
// import { io } from "../server";

const router = express.Router();
export default router;

import chatRouter from "./endpoints/chat.js"
import dalleRouter from "./endpoints/dalle.js"


router.use("", chatRouter);
router.use("", dalleRouter);

