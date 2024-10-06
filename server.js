import express, { urlencoded, json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.OPENAI_API_KEY);

import { networkInterfaces } from 'os';
import "./testing.js";

const app = express();

// app.use(cors({ origin: "*" }));


const corsOptions = {
  origin: 'https://litlabbooks.com', // Cambia esto por tu dominio o usa '*' para permitir todos
  methods: [
      'GET', 
      'POST', 
      'PUT', 
      'DELETE', 
      'OPTIONS', 
      'PATCH' // Añade cualquier otro método que necesites
  ],
  allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With' // Puedes añadir más encabezados permitidos
  ],
  exposedHeaders: [
      'Content-Length', 
      'X-Knowledge-Base-Id' // Añade los encabezados que deseas exponer al cliente
  ],
  credentials: true, // Permite enviar cookies y credenciales
  preflightContinue: false, // Si deseas que la respuesta a la solicitud preflight se gestione automáticamente
};

app.use(cors(corsOptions));



const PORT = process.env.PORT || 3000;

// **Coloca la ruta del webhook al inicio, antes de cualquier middleware global que procese JSON**
import webhook from './routes/payment/endpoints/webhook.js';
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhook);

// Middleware global para analizar `urlencoded` y `json`
app.use(urlencoded({ extended: true }));
app.use(json());

// Otros middlewares y rutas
import router_gpt from './routes/gpt/gpt.js';
import router_book from './routes/book/book.js';
import customer_routes from './routes/database/customerRoutes.js';
import purchase_routes from './routes/database/purchaseRoutes.js';
import book_routes from './routes/database/BookRoutes.js';
import payment_routes from './routes/payment/payment.js';
import auth_routes from './routes/auth/auth.js';

// Define otras rutas después de la configuración del webhook
app.use("/gpt", router_gpt);
app.use("/book", router_book);
app.use('/api', customer_routes);
app.use('/api', purchase_routes);
app.use('/api', book_routes);
app.use('/api', payment_routes);
app.use('/auth', auth_routes);

// Iniciar la aplicación Express
app.listen(PORT, () => {
  const interfaces = networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((iface) => iface.family === "IPv4" && !iface.internal)
    .map((iface) => iface.address);

  const localUrl = `http://localhost:${PORT}`;
  const networkUrl = `http://${addresses.length > 0 ? addresses[0] : "localhost"}:${PORT}`;
  
  console.log(`API running at:`);
  console.log(`- Local:   ${localUrl}`);
  console.log(`- Network: ${networkUrl}`);
});
