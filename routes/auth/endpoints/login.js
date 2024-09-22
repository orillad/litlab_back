import bcrypt from 'bcryptjs';
import { generateToken } from '../../../utils/jwt.js';  // Utilizamos la función para generar JWT
import { Router } from 'express';
import { getAdminByEmail } from '../../../controllers/adminContoller.js';
const router = Router();

/**
 * Login del administrador.
 * @param {Request} req - La solicitud del cliente.
 * @param {Response} res - La respuesta del servidor.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(email);
        
        // Buscar el administrador en la base de datos
        // const admin = await getAdminByEmail(email);
        const admin = await getAdminByEmail(email);
        console.log("admin",admin);
        
        
        if (!admin) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        // Verificar la contraseña utilizando bcrypt
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar el token JWT con el email y el rol de administrador
        const token = generateToken({ email: admin.email, role: 'admin' });

        res.json({ token });  // Devolvemos el token al cliente
    } catch (err) {
        console.error('Error al procesar el login:', err.message);
        res.status(500).json({ message: 'Error en el servidor', error: err.message });
    }
});


export default router;
