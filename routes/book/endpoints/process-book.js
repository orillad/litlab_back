import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import * as customerController from '../../../controllers/customerController.js';
import * as purchaseController from '../../../controllers/purchaseController.js';


const router = Router();

// Calculate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.post('/process-book', async (req, res) => {
    try {
        const { bookId, customerInfo } = req.body;
        console.log('Received payment request:', { bookId, customerInfo });


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

        const filePath = join(__dirname, `../../../books/${bookId}.pdf`);
        console.log('Checking file path:', filePath);

        if (existsSync(filePath)) {
            // Pass `res` as part of the context rather than in `req.body`
            const purchase = await purchaseController.createPurchase({ body: { customerId, bookId } }, res);
            console.log("puurchasee", purchase);
            
            if(purchase){
                console.log("Purchase created successfully");
                console.log("Sending success response");
                return res.status(200).json({ success: true, message: 'Success response', downloadUrl: `/download-book/${bookId}`, purchaseId: purchase.data.id });

            }

        
        } else {
            console.log('Book not found');
            if (!res.headersSent) {
                return res.status(404).json({ success: false, message: 'Book not found' });
            }
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
router.get('/download-book/:bookId', (req, res) => {
    const { bookId } = req.params;
    const filePath = join(__dirname, `../../../books/${bookId}.pdf`);

    if (existsSync(filePath)) {
        res.download(filePath, `${bookId}.pdf`, async (err) => {
            if (err) {
                console.error('Error during download', err);
                res.status(500).send('Error during download');
            }
            //  else {
            //     try {
            //         await unlink(filePath);
            //     } catch (unlinkErr) {
            //         console.error('Error deleting file after download', unlinkErr);
            //     }
            // }
        });
    } else {
        res.status(404).send('Book not found');
    }
});

export default router;