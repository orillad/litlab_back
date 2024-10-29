import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import * as customerController from '../../../controllers/customerController.js';
import * as purchaseController from '../../../controllers/purchaseController.js';
import { sendEmail } from '../../../mail/sendEmail.js';
import { v4 as uuidv4 } from 'uuid'; // Llibreria per generar tokens únics


const router = Router();

// Calculate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.post('/process-book', async (req, res) => {
    try {
        const { bookName, customerInfo } = req.body;
        console.log('Received payment request:', { bookName, customerInfo });

        const email = customerInfo.email;
        console.log('Looking up customer with email:', email);

        const existingCustomer = await customerController.findCustomerByEmail(email);

        let customerId;
        if (existingCustomer.found) {
            console.log('Customer found:', existingCustomer.customer);
            customerId = existingCustomer.customer.id;
        } else {
            console.log('Customer not found, adding new customer:', customerInfo);
            const addCustomerResponse = await customerController.addCustomer(customerInfo);
            console.log(addCustomerResponse.customer.id);
            
            customerId = addCustomerResponse.customer.id;
        }

        const templatePath = './mail/templates/generating.ejs'; // Ruta a la plantilla EJS
        const usr_mail = email; // Correo destinatario
        const subject = 'Welcome to LitLab Books'; // Email subject
        const templateData = { name: existingCustomer.customer.name, book_title: bookName.replace(/_/g, ' ') }; // Datos para la plantilla
        console.log("Sending email...");

        // Enviar el correo
        sendEmail(templatePath, usr_mail, subject, templateData);

        const purchase = await purchaseController.createPurchase({ body: { customerId, bookName } }, res);
        console.log("Purchase created successfully:", purchase);
        
        if (purchase) {
            console.log("Sending success response");
            return res.status(200).json({ success: true, message: 'Purchase created successfully', purchase: purchase.data });
        }

    } catch (error) {
        console.error('Error processing payment:', error.message);
        console.error(error.stack);

        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Error processing payment' });
        }
    }
});





// Route to download the book after successful payment
router.get('/download-book/:token', async (req, res) => {
    const { token } = req.params;

    // Verifica el token a la base de dades (pseudo codi)
    const response = await purchaseController.getBookNameByToken(token);
    

    if (response.found) {
        const bookName = response.bookName
        const filePath = join(__dirname, `../../../books/${bookName}.pdf`);

        if (existsSync(filePath)) {
            res.setHeader('Content-Disposition', `attachment; filename="${bookName}.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');

            res.download(filePath, `${bookName}.pdf`, (err) => {
                if (err) {
                    console.error('Error during download', err);
                    res.status(500).send('Error during download');
                }
            });
        } else {
            res.status(404).send('Book not found');
        }
    } else {
        res.status(403).send('Invalid or expired token');
    }
});



router.get('/get-download-link/:bookName', async (req, res) => {
    const { bookName } = req.params;
    const filePath = join(__dirname, `../../../books/${bookName}.pdf`);

    if (existsSync(filePath)) {
        // Genera un codi únic per a aquest llibre

        // Guarda el codi en la base de dades (pseudo codi)
        const purchaseData = await purchaseController.getPurchaseByBookName(bookName)
        console.log(purchaseData);
        

        // Genera la URL de descàrrega amb el codi
        const downloadUrl = `${req.protocol}://${req.get('host')}/book/download-book/${purchaseData.data.downloadtoken}`;

        res.status(200).json({
            message: 'Download link generated',
            url: downloadUrl
        });
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

export default router;
