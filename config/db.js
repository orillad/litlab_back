// config/db.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Configuración de la conexión a la base de datos sin SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Desactiva completamente SSL
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the database');
  release();
});

// Exportar el pool para su uso en otros módulos
export default pool;
