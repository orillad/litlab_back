// routes/sendEmail.js
import express from 'express';
import path from 'path';
import { sendEmail } from '../../mail/sendEmail.js';

const router = express.Router();

// Endpoint para enviar correos
router.post('/send-email', async (req, res) => {
  const { templatePath, usr_mail, subject, templateData } = req.body;

  // Validar la entrada
  if (!templatePath || !usr_mail || !subject || !templateData) {
    return res.status(400).json({ error: 'Faltan datos en la solicitud.' });
  }

  try {
    await sendEmail(templatePath, usr_mail, subject, templateData);
    return res.status(200).json({ message: 'Correo enviado con éxito.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});

export default router;
