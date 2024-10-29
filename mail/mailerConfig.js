// mailerConfig.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


// Configuración del transportador usando las variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Servidor SMTP desde el .env
  port: parseInt(process.env.SMTP_PORT, 10), // Puerto SMTP desde el .env
  secure: process.env.SMTP_PORT == '465', // true para puerto 465 (SSL/TLS)
  auth: {
    user: process.env.SMTP_USER, // Usuario SMTP desde el .env
    pass: process.env.SMTP_PASSWORD // Contraseña SMTP desde el .env
  },
  tls: {
    rejectUnauthorized: false // Evitar errores de certificados no autorizados
  }
});

export default transporter;
