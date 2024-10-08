import express, { urlencoded, json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { networkInterfaces } from 'os';

dotenv.config();

console.log(process.env.OPENAI_API_KEY);

// Comprobar si estamos en producción o en desarrollo
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: isProduction ? 'https://litlabbooks.com' : '*', // Cambiar según el entorno
  methods: [
    'GET', 
    'POST', 
    'PUT', 
    'DELETE', 
    'OPTIONS', 
    'PATCH'
  ],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With'
  ],
  exposedHeaders: [
    'Content-Length', 
    'X-Knowledge-Base-Id'
  ],
  credentials: true,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Ruta del webhook
import webhook from './routes/payment/endpoints/webhook.js';
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhook);

// Middleware global para analizar `urlencoded` y `json`
app.use(urlencoded({ extended: true }));
app.use(json());

// Rutas de la aplicación
import router_gpt from './routes/gpt/gpt.js';
import router_book from './routes/book/book.js';
import customer_routes from './routes/database/customerRoutes.js';
import purchase_routes from './routes/database/purchaseRoutes.js';
import book_routes from './routes/database/BookRoutes.js';
import payment_routes from './routes/payment/payment.js';
import auth_routes from './routes/auth/auth.js';

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
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`); // Muestra el entorno
});
