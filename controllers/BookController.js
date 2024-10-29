import pool from '../config/db.js';

// Insert a new book name
export const insertBook = async (book_name, bookFormat) => {
  // Verificar si se proporcionó el nombre del libro
  if (!book_name) {
    return { error: true, message: 'Book name is required' };
  }

  // Verificar si se proporcionó el tipo de libro
  if (!bookFormat || !['pdf', 'physical'].includes(bookFormat)) {
    return { error: true, message: 'Valid book type is required (pdf or physical)' };
  }

  try {
    // Consulta SQL para insertar el nombre del libro en la tabla `books`
    const query = `
      INSERT INTO books (book_name, type) 
      VALUES ($1, $2) RETURNING *;
    `;
    const values = [book_name, bookFormat];
    const { rows, rowCount } = await pool.query(query, values);

    // Verificar si se insertó correctamente el registro
    if (rowCount === 0) {
      return { error: true, message: 'Error inserting book name' };
    }

    // Devolver el registro insertado
    return { error: false, message: 'Book name inserted successfully', data: rows[0] };
  } catch (error) {
    console.error('Error in insertBook:', error);
    return { error: true, message: 'Internal Server Error', details: error.message };
  }
};


// Obtener un book por ID
export const getBookById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ exists: false, error: 'Invalid ID provided' });
  }

  try {
    const { rows, rowCount } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ exists: false, error: 'PDF not found' });
    }

    res.status(200).json({ exists: true, pdf: rows[0] });
  } catch (error) {
    console.error('Error in getBookById:', error.message);
    res.status(500).json({ exists: false, error: 'Internal Server Error', details: error.message });
  }
};

// Obtener todos los books
export const getAllBooks = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM books');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error in getAllbooks:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Obtener un book por nombre
export const getBookByName = async (req, res) => {
  const { bookName } = req.params;

  if (!bookName) {
    return res.status(400).json({ exists: false, error: 'Invalid bookName provided' });
  }

  try {
    const { rows, rowCount } = await pool.query('SELECT * FROM books WHERE book_name = $1', [bookName]);

    if (rowCount === 0) {
      return { error: true, exist:false, message: 'Error finding book' };
    }

    // Devolver el registro insertado
    return { error: false, message: 'Book founded successfully', exist:true, data: rows[0] };
  } catch (error) {
    console.error('Error in getBookByName:', error);
    return { error: true, message: 'Internal Server Error', details: error.message };
  }
};