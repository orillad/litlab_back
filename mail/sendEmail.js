// sendEmail.js
import transporter from './mailerConfig.js';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';

// Función para enviar correos
export async function sendEmail(templatePath, usr_mail, subject, templateData) {
  try {
    // Leer y compilar la plantilla
    const emailTemplate = fs.readFileSync(path.resolve(templatePath), 'utf-8');
    const compiledTemplate = ejs.compile(emailTemplate);
    const html = compiledTemplate(templateData);

    // Opciones del correo
    const mailOptions = {
      from: `"LitLab Books" <${process.env.SMTP_USER}>`,
      to: usr_mail.toLowerCase(),
      subject: subject,
      html: html,
      headers: {
        'Message-ID': `<${Date.now()}@litlabbooks.com>` // Cambia el dominio según sea necesario
      }
    };
    // console.log(mailOptions);
    

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
  }
}

