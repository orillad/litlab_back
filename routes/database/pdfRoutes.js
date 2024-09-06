import express from 'express';
import { getAllPdfs, getPdfById, getPdfByName, insertPdf } from '../../controllers/pdfController.js';

const router = express.Router();

router.post('/pdfs', insertPdf);
router.get('/pdfs', getAllPdfs);
router.get('/pdfs/:bookName', getPdfByName);
router.get('/pdfs/id/:id', getPdfById);

export default router;
