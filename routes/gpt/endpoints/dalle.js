// litlab_back/routes/gpt/endpoints/dalle.js
import express from 'express';
import axios from 'axios';
import OpenAI from "openai";
import dotenv from 'dotenv';
import cors from 'cors';
import fs from "fs"; // Importar fs
import sharp from "sharp";
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

        // Retornar la URL de la imagen en lugar de la imagen misma
        res.json({ imageUrl });
    } catch (error) {
        console.error('Error al hacer la petición a la API de OpenAI:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



const MAX_SIZE_MB = 4;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

router.post('/dalle/edit', async (req, res) => {
    const { prompt, imagePath } = req.body;

    if (!prompt || !imagePath) {
        return res.status(400).json({ error: 'El prompt y imagePath son requeridos' });
    }

    try {
        // Leer la imagen original
        const originalImageBuffer = fs.readFileSync(imagePath);

        // Obtener los metadatos de la imagen original
        const metadata = await sharp(originalImageBuffer).metadata();

        // Convertir a PNG y asegurar formato RGBA
        let processedImageBuffer = await sharp(originalImageBuffer)
            .ensureAlpha() // Asegura que la imagen tenga un canal alfa (RGBA)
            .toFormat('png') // Asegura que el formato de salida sea PNG
            .toBuffer();

        // Reducción del tamaño de la imagen si es necesario
        let finalImageBuffer = processedImageBuffer;
        while (finalImageBuffer.length > MAX_SIZE_BYTES) {
            finalImageBuffer = await sharp(finalImageBuffer)
                .resize({ width: Math.floor(metadata.width * 0.9), height: Math.floor(metadata.height * 0.9), fit: 'inside' })
                .toFormat('png', { quality: 80 }) // Ajusta la calidad si es necesario
                .toBuffer();
        }

        // Guardar la imagen procesada temporalmente
        const tempImagePath = path.join(__dirname, 'temp_image.png');
        fs.writeFileSync(tempImagePath, finalImageBuffer);

        // Enviar la imagen a la API de OpenAI
        const image = await openai.images.edit({
            image: fs.createReadStream(tempImagePath),
            prompt: prompt,
        });

        const imageUrl = image.data[0].url;

        // Hacer la solicitud de la imagen desde el servidor backend
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageResultBuffer = Buffer.from(imageResponse.data, 'binary');

        // Eliminar el archivo temporal
        fs.unlinkSync(tempImagePath);

        res.set('Content-Type', 'image/png');
        res.send(imageResultBuffer);
    } catch (error) {
        console.error('Error al hacer la petición a la API de OpenAI:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;