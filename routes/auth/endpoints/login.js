import bcrypt from 'bcryptjs';
import { generateToken } from '../../../utils/jwt.js';  // Utilizamos la función para generar JWT
import supabase from '../../../config/supabaseClient.js';
import { Router } from 'express';

const router = Router();

/**
 * Login del administrador.
 * @param {Request} req - La solicitud del cliente.
 * @param {Response} res - La respuesta del servidor.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el administrador en la base de datos
        const { data, error } = await supabase
            .from('admin')
            .select('email, password')
            .eq('email', email)
            .single();  // Esperamos solo un registro, ya que el email debería ser único

        if (error || !data) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Verificar la contraseña utilizando bcrypt
        const isPasswordValid = await bcrypt.compare(password, data.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar el token JWT con el email y el rol de administrador
        const token = generateToken({ email: data.email, role: 'admin' });

        res.json({ token });  // Devolvemos el token al cliente
    } catch (err) {
        console.error('Error al procesar el login:', err.message);
        res.status(500).json({ message: 'Error en el servidor', error: err.message });
    }
});


export default router;
