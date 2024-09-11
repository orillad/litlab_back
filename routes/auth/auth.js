// litlab_back/routes/auth/auth.js

import express from "express";
// import { io } from "../server";

const router = express.Router();
export default router;

import loginRouter from "./endpoints/login.js"
import jwtRouter from './endpoints/veify.js'

router.use("", loginRouter);
router.use("", jwtRouter);

