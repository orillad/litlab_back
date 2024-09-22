// adminController.js
import pool from "../config/db.js";
// Obtener todos los administradores
export const getAllAdmins = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admin');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener administradores' });
  }
};

// Obtener un administrador por email
export const getAdminByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw new Error('Error al obtener el administrador');
  }
};

// Crear un nuevo administrador
export const createAdmin = async (email, password) => {
  try {
    const result = await pool.query(
      'INSERT INTO admin (email, password) VALUES ($1, $2) RETURNING *',
      [email, password]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw new Error('Error al crear el administrador');
  }
};

// Actualizar un administrador por email
export const updateAdmin = async (email, newEmail, password) => {
  try {
    const result = await pool.query(
      'UPDATE admin SET email = $1, password = $2 WHERE email = $3 RETURNING *',
      [newEmail || email, password, email]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw new Error('Error al actualizar el administrador');
  }
};

// Eliminar un administrador por email
export const deleteAdmin = async (email) => {
  try {
    const result = await pool.query('DELETE FROM admin WHERE email = $1 RETURNING *', [email]);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw new Error('Error al eliminar el administrador');
  }
};


