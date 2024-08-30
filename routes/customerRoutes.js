import express from 'express';
import { getAllCustomers, addCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.get('/customers', getAllCustomers);
router.post('/customers', addCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);

export default router;
