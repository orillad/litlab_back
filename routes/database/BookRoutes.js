import express from 'express';
import { getAllBooks, getBookById, getBookByName, insertBook } from '../../controllers/BookController.js';

const router = express.Router();

router.post('/books', insertBook);
router.get('/books', getAllBooks);
router.get('/books/:bookName', getBookByName);
router.get('/books/id/:id', getBookById);

export default router;
