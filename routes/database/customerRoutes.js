import express from 'express';
import { getAllCustomers, addCustomer, updateCustomer, deleteCustomer, findCustomerByEmail, findCustomerById } from '../../controllers/customerController.js';

const router = express.Router();

router.get('/customers', getAllCustomers);
router.post('/customers', addCustomer);
router.get('/customers/:id', findCustomerById);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);
router.get('/customers/email/:email', findCustomerByEmail)

export default router;
