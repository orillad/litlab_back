import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

const router = Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

/**
 * Verifica el token JWT.
 * @param {Request} req - La solicitud del cliente.
 * @param {Response} res - La respuesta del servidor.
 */
router.post('/verify', async (req, res) => {
        console.log("VERIFYYYYY");
    
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header Authorization

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }

        // Token válido
        res.status(200).json({ message: 'Token válido', user: decoded });
    });
});

export default router;
