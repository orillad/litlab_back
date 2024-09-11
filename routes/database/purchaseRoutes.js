import express from 'express';
import { createPurchase, getPurchasesByCustomer, getPdfByPurchase, updatePurchase, deletePurchase, getPurchases } from '../../controllers/purchaseController.js';

const router = express.Router();

router.get('/purchases', getPurchases);
router.post('/purchases', createPurchase);
router.get('/purchases/customer/:customerId', getPurchasesByCustomer);
router.get('/purchases/:purchaseId/pdf', getPdfByPurchase);
router.put('/purchases/:id', updatePurchase);
router.delete('/purchases/:id', deletePurchase);

export default router;