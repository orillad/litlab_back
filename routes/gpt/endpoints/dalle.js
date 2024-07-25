import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/dalle', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'El prompt es requerido' });
    }

    try {
        // Llamada a la API de OpenAI para generar una imagen con DALL·E
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt: prompt,
            n: 1, // Número de imágenes a generar
            size: '1024x1024' // Tamaño de la imagen
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        // Obtener la URL de la imagen generada
        const imageUrl = response.data.data[0].url;
        res.json({ imageUrl: imageUrl });
    } catch (error) {
        console.error('Error al hacer la petición a la API de OpenAI:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
