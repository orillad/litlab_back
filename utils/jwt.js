import jwt from 'jsonwebtoken';

// Leer la clave secreta desde las variables de entorno
const secretKey = process.env.JWT_SECRET_KEY;

if (!secretKey) {
  throw new Error('JWT secret key is not defined');
}

/**
 * Genera un JWT.
 * @param {Object} payload - La información que se incluye en el token.
 * @param {string} [expiresIn='1h'] - Tiempo de expiración del token (opcional).
 * @returns {string} - El token JWT.
 */
const generateToken = (payload, expiresIn = '1h') => {
  console.log("JWT GENERATED");
  
  return jwt.sign(payload, secretKey, { expiresIn });
};

/**
 * Verifica un JWT.
 * @param {string} token - El token JWT a verificar.
 * @returns {Object} - El contenido decodificado del token.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};


export { generateToken, verifyToken };
