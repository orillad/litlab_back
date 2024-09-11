// litlab_back/server.js

import express, { urlencoded, json } from 'express';
// const db = require('./models');
// const routes = require('./routes');
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.OPENAI_API_KEY);

import { networkInterfaces } from 'os';
import "./testing.js";



const app = express();

app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 3000;


app.use(urlencoded({ extended: true }));
app.use(json());
// app.use(static('public'));

// app.use('/', routes);


import router_gpt from './routes/gpt/gpt.js';
import router_book from './routes/book/book.js'
import costumer_routes from './routes/database/customerRoutes.js'
import purchase_routes from './routes/database/purchaseRoutes.js'
import pdf_routes from './routes/database/pdfRoutes.js'
import payment_routes from './routes/payment/payment.js'
import auth_routes from './routes/auth/auth.js'



app.use("/gpt", router_gpt);
app.use("/book", router_book);
app.use('/api', costumer_routes);
app.use('/api', purchase_routes);
app.use('/api', pdf_routes);
app.use('/api', payment_routes);
app.use('/auth', auth_routes);

// Sync sequelize models then start Express app
// =============================================
app.listen(PORT, () => {
  // db the IPv4 addresses for internal network interfaces
  const interfaces = networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((iface) => iface.family === "IPv4" && !iface.internal)
    .map((iface) => iface.address);

  const localUrl = `http://localhost:${PORT}`;
  const networkUrl = `http://${addresses.length > 0 ? addresses[0] : "localhost"
    }:${PORT}`;
  // console.clear()
  console.log(`API running at:`);
  console.log(`- Local:   ${localUrl}`);
  console.log(`- Network: ${networkUrl}`);
});