// litlab_back/routes/gpt/endpoints/chat.js

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/chat', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'El prompt es requerido' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const chatGptResponse = response.data.choices[0].message.content;
        res.json({ response: chatGptResponse });
    } catch (error) {
        console.error('Error al hacer la petición a la API de OpenAI:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



export default router;
