import { Router } from 'express';
const router = Router();
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

// Ejemplo de ruta de pago (esto depende del servicio de pago que uses)
router.post('/process-payment', async (req, res) => {
    const { bookId } = req.body;

    // Aquí deberías procesar el pago con el servicio que elijas (Stripe, PayPal, etc.)
    const paymentSuccess = true; // Simula una respuesta de pago exitoso

    if (paymentSuccess) {
        const filePath = join(__dirname, `../books/${bookId}.pdf`);

        if (existsSync(filePath)) {
            res.json({ success: true, downloadUrl: `/download-book/${bookId}` });
        } else {
            res.status(404).json({ success: false, message: 'Book not found' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Payment failed' });
    }
});

// Ruta para descargar el libro después del pago exitoso
router.get('/download-book/:bookId', (req, res) => {
    const { bookId } = req.params;
    const filePath = join(__dirname, `../books/${bookId}.pdf`);

    if (existsSync(filePath)) {
        res.download(filePath, `${bookId}.pdf`, (err) => {
            if (err) {
                console.error('Error during download', err);
            } else {
                // Elimina el archivo después de la descarga
                unlinkSync(filePath);
            }
        });
    } else {
        res.status(404).send('Book not found');
    }
});

export default router;

