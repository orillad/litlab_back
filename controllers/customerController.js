import pool from '../config/db.js'

// Obtener todos los clientes
export const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Añadir un nuevo cliente
export const addCustomer = async (customerData) => {
  const { first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address } = customerData;

  // Verificar campos obligatorios
  if (!first_name || !last_name || !email) {
    return { error: 'Missing required fields: first_name, last_name, or email' };
  }

  try {
    const result = await pool.query(
      'INSERT INTO customers (first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address]
    );

    return { success: true, customer: result.rows[0] };
  } catch (error) {
    console.error('Error adding customer:', error);
    return { error: 'Error adding customer', details: error.message };
  }
};


// Actualizar un cliente
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  try {
    const result = await pool.query(
      'UPDATE customers SET first_name = $1, last_name = $2, email = $3, mobile_phone = $4, country = $5, state_province = $6, postal_code = $7, shipping_address = $8 WHERE id = $9 RETURNING *',
      [first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Eliminar un cliente
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Buscar un cliente por correo electrónico
export const findCustomerByEmail = async (email) => {
  if (!email) {
    return { error: 'Email parameter is required' };
  }

  try {
    const result = await pool.query('SELECT * FROM customers WHERE email = $1 LIMIT 1', [email]);

    if (result.rowCount > 0) {
      return { found: true, customer: result.rows[0] };
    } else {
      return { found: false };
    }
  } catch (error) {
    console.error('Error finding customer by email:', error);
    return { error: 'Internal Server Error', details: error.message };
  }
};


// Buscar un cliente por ID
export const findCustomerById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1 LIMIT 1', [id]);

    if (result.rowCount > 0) {
      res.status(200).json({ found: true, customer: result.rows[0] });
    } else {
      res.status(200).json({ found: false });
    }
  } catch (error) {
    console.error('Error finding customer by ID:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
