import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Llibreria per generar tokens únics

// Crear una nueva compra con un PDF
export const createPurchase = async (req, res) => {
  try {
    const { customerId, bookName } = req.body;
    console.log('Creating purchase for customer:', customerId);

    // Obtener el PDF por ID
    const { rows: pdfData, rowCount: pdfCount } = await pool.query('SELECT id FROM books WHERE book_name = $1', [bookName]);

    if (pdfCount === 0) {
      return { error: 'BOOK not found' };
    }

    // Insertar la compra en la tabla purchases
    const { rows: purchaseData } = await pool.query(
      'INSERT INTO purchases (customer_id, book_id, downloadToken) VALUES ($1, $2, $3) RETURNING *',
      [customerId, pdfData[0].id, uuidv4()]
    );

    return { message: 'Purchase created successfully', data: purchaseData[0] };
  } catch (error) {
    console.error('Error in createPurchase:', error);
    return { error: 'Internal Server Error', details: error.message };
  }
};


// Obtener todas las compras de un cliente
export const getPurchases = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM purchases');

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error in getPurchases:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Obtener compras por cliente
export const getPurchasesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const { rows } = await pool.query(
      'SELECT id, purchase_date, book_id FROM purchases WHERE customer_id = $1',
      [customerId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error in getPurchasesByCustomer:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Obtener un PDF asociado a una compra
export const getPdfByPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const { rows: purchaseData, rowCount } = await pool.query('SELECT book_id FROM purchases WHERE id = $1', [purchaseId]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const { rows: pdfData } = await pool.query('SELECT book_name FROM books WHERE id = $1', [purchaseData[0].pdf_id]);

    // Guardar el archivo PDF en el sistema de archivos local
    const filePath = path.join(__dirname, 'downloaded_file.pdf');
    fs.writeFileSync(filePath, Buffer.from(pdfData[0].pdf_file));

    res.status(200).sendFile(filePath);
  } catch (error) {
    console.error('Error in getPdfByPurchase:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Actualizar una compra
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, pdfId } = req.body;

    const { rows } = await pool.query(
      'UPDATE purchases SET customer_id = $1, book_id = $2 WHERE id = $3 RETURNING *',
      [customerId, pdfId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error in updatePurchase:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

export const updatePurchaseState = async (req, res) => {
  try{
    const { purchaseId } = req.params;

const { rows } = await pool.query(
      'UPDATE purchases SET payment_state = $1 WHERE id = $2 RETURNING *',
      ["payment_done", purchaseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    return { message: 'Purchase updated successfully', data: rows[0] };
  } catch (error) {
    console.error('Error in updatePurchaseState:', error);
    return { error: 'Internal Server Error', details: error.message };
  }
}


// Eliminar una compra
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const { rowCount } = await pool.query('DELETE FROM purchases WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error in deletePurchase:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


export const getPurchaseById = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    console.log(purchaseId);
    

    // Consultar la compra en la base de datos por su ID
    const { rows, rowCount } = await pool.query(
      'SELECT id, customer_id, purchase_date, book_id, payment_state FROM purchases WHERE id = $1',
      [purchaseId]
    );

    // Verificar si la compra existe
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Purchase not foundd' });
    }

    // Devolver la información de la compra
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error in getPurchaseById:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


export const getPurchaseByBookName = async (bookName) => {
  try {
    // const { bookName } = req.params;
    if (!bookName) {
      return { error: 'bookName parameter is required' };
    }
    console.log(bookName);

    // Primero, buscar el bookId en la tabla de libros usando el bookName
    const bookResult = await pool.query(
      'SELECT id FROM books WHERE book_name = $1',
      [bookName]
    );

    // Verificar si el libro existe
    if (bookResult.rowCount === 0) {
      return { found: false, error: 'Book not found' };
    }

    const bookId = bookResult.rows[0].id;

    // Consultar la compra en la base de datos por el bookId obtenido
    const { rows, rowCount } = await pool.query(
      'SELECT id, customer_id, purchase_date, book_id, payment_state, downloadToken FROM purchases WHERE book_id = $1',
      [bookId]
    );

    // Verificar si la compra existe
    if (rowCount === 0) {
      return { found: false, error: 'Purchase not found' };
    }

    // Devolver la información de la compra
    return { found: true, data: rows[0] };
  } catch (error) {
    console.error('Error in getPurchaseByBookName:', error);
    return { error: 'Internal Server Error', details: error.message };
  }
};


export const getBookNameByToken = async (downloadToken) => {
  try {
    if (!downloadToken) {
      return { error: 'downloadToken parameter is required' };
    }

    console.log(downloadToken);

    // Primero, buscar el bookId en la tabla de purchases usando el downloadToken
    const purchaseResult = await pool.query(
      'SELECT book_id FROM purchases WHERE downloadToken = $1',
      [downloadToken]
    );

    // Verificar si la compra con el token existe
    if (purchaseResult.rowCount === 0) {
      return { found: false, error: 'Purchase not found' };
    }

    const bookId = purchaseResult.rows[0].book_id;

    // Consultar el nombre del libro en la tabla de libros por el bookId obtenido
    const { rows, rowCount } = await pool.query(
      'SELECT book_name FROM books WHERE id = $1',
      [bookId]
    );

    // Verificar si el libro existe
    if (rowCount === 0) {
      return { found: false, error: 'Book not found' };
    }

    // Devolver el nombre del libro
    return { found: true, bookName: rows[0].book_name };
  } catch (error) {
    console.error('Error in getBookNameByToken:', error);
    return { error: 'Internal Server Error', details: error.message };
  }
};




