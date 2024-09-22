// litlab_back/routes/book/book.js

import express from "express";
// import { io } from "../server";

const router = express.Router();
export default router;

import generateBookRouter from "./endpoints/genereate-book.js"
import processPaymenrRouter from "./endpoints/process-book.js"

router.use("", generateBookRouter);
router.use("", processPaymenrRouter);
