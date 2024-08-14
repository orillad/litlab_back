import express from 'express';
import axios from 'axios';
import OpenAI from "openai";
import dotenv from 'dotenv';
import cors from 'cors';
import fs from "fs"; // Importar fs

dotenv.config();

const app = express();
app.use(cors()); // Permitir todas las solicitudes CORS
app.use(express.json()); // Asegurarse de que el cuerpo de la solicitud se pueda analizar como JSON

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});
const router = express.Router();

// Endpoint para generar imágenes
router.post('/dalle', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'El prompt es requerido' });
    }

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt
        });

        const imageUrl = response.data[0].url;

        // Hacer la solicitud de la imagen desde el servidor backend
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error al hacer la petición a la API de OpenAI:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para editar imágenes
router.post('/dalle/edit', async (req, res) => {
    const { prompt, imagePath } = req.body;
    console.log("imageeeeee")
    console.log(imagePath);
    

    console.log(prompt);
    if (!prompt || !imagePath) {
        
        return res.status(400).json({ error: 'El prompt, imagePath son requeridos' });
    }

    try {
        const image = await openai.images.edit({
            image: fs.createReadStream(imagePath),
            prompt: prompt,
        });

        const imageUrl = image.data[0].url;

        // Hacer la solicitud de la imagen desde el servidor backend
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error al hacer la petición a la API de OpenAI:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
