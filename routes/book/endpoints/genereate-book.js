import { Router } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { generateToken } from '../../../utils/jwt.js'; // Importa la función para generar JWT
import supabase from '../../../config/supabaseClient.js';
import { fileURLToPath } from 'url';


const router = Router();
const baseDir = path.resolve('books');




// Get the directory name from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../../');

// Construct absolute paths for fonts
const fonts = {
  arabic: path.join(projectRoot, 'fonts/NotoSansArabic-VariableFont_wdth,wght.ttf'),
  catalan: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  spanish: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  french: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  galician: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  hindi: path.join(projectRoot, 'fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'),
  english: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  italian: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  mandarin: path.join(projectRoot, 'fonts/NotoSansTC-VariableFont_wght.ttf'),
  portuguese: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  russian: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  basque: path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf')
};

console.log(fonts);


const getFontForLanguage = (language) => {
  return fonts[language] || '../../../../fonts/NotoSans-VariableFont_wdth,wght.ttf'; // Usa una font predeterminada si no hi ha coincidència
};


// Función para descargar una imagen desde una URL y convertirla en un buffer
const downloadImageAsBuffer = async (imageUrl) => {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to fetch image');
  return await response.buffer();
};

// Función para agregar una portada
const addCoverPage = (doc, title, lang) => {
  doc.addPage({ size: 'A4', margins: { top: 100, bottom: 50, left: 50, right: 50 } });

  const fontPath = getFontForLanguage(lang);

  doc.fontSize(42).font(fontPath).text(title, {
    align: 'center',
    valign: 'center'
  });
  doc.moveDown(2);
  doc.fontSize(18).font('Times-Roman').text('By litlab with ChatGPT', {
    align: 'center',
  });
  doc.addPage();
};

// Función para agregar un capítulo
const addChapter = async (doc, chapter, lang) => {
  doc.addPage({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });

  const fontPath = getFontForLanguage(lang);

  // Agregar título del capítulo
  doc.fontSize(30).font(fontPath).text(chapter.title, {
    align: 'center'
  });
  doc.moveDown(1.5);

  // Agregar el texto del capítulo
  doc.fontSize(14).font(fontPath).text(chapter.text, {
    align: 'justify'
  });

  // Espacio adicional antes de la imagen
  doc.moveDown(2);

  if (chapter.imageUrl) {
    try {
      // Descargar la imagen como buffer
      const imageBuffer = await downloadImageAsBuffer(chapter.imageUrl);

      // Verificar el tamaño de la imagen para decidir si cabe en la página
      const image = doc.openImage(imageBuffer);
      const imageWidth = image.width;
      const imageHeight = image.height;

      const margins = { top: 50, bottom: 50, left: 60, right: 60 };
      const pageWidth = 595.276; // A4 page width in points
      const pageHeight = 841.890; // A4 page height in points

      // Ajustar tamaño de la imagen para que se ajuste a la página si es necesario
      let fitWidth = pageWidth - margins.left - margins.right;
      let fitHeight = pageHeight - margins.top - margins.bottom;

      let scale = Math.min(fitWidth / imageWidth, fitHeight / imageHeight);

      // Reducir la imagen manteniendo su relación de aspecto
      const scaledWidth = imageWidth * scale;
      const scaledHeight = imageHeight * scale;

      // Añadir margen adicional si la imagen es demasiado grande
      const maxImageHeight = pageHeight - margins.top - margins.bottom - 50; // Ajustar el valor según sea necesario
      if (scaledHeight > maxImageHeight) {
        scale = maxImageHeight / imageHeight;
        scaledWidth = imageWidth * scale;
        scaledHeight = imageHeight * scale;
      }

      const xPos = (pageWidth - scaledWidth) / 2;
      let yPos = doc.y;

      // Verificar si la imagen cabe en la página actual
      if (yPos + scaledHeight > pageHeight - margins.bottom) {
        doc.addPage({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });
        yPos = margins.top; // Reset vertical position for new page
      }

      doc.image(imageBuffer, xPos, yPos, {
        width: scaledWidth,
        height: scaledHeight,
        align: 'center',
        valign: 'top'
      });

      // Ajustar posición vertical después de la imagen
      doc.moveDown(2);

    } catch (error) {
      console.error('Error loading image:', error);
    }
  }

  doc.moveDown(2);
};


// Endpoint para generar el libro
router.post('/generate-book', async (req, res) => {
  const { title, chapters, lang } = req.body;

  if (!title || !Array.isArray(chapters)) {
    return res.status(400).json({ success: false, message: 'Invalid title or chapters format' });
  }
  const bookId = title.replace(/\s+/g, '_')

  const doc = new PDFDocument({ size: 'A4', layout: 'portrait' });
  const filePath = path.join(baseDir, `${title.replace(/\s+/g, '_')}.pdf`);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Agregar portada
  addCoverPage(doc, title, lang);

  // Agregar capítulos
  for (const chapter of chapters) {
    await addChapter(doc, chapter, lang);
  }

  doc.end();

  // Esperar a que el archivo se haya guardado
  writeStream.on('finish', async () => {

    // Insertar el PDF en la tabla pdfs
    const { data: pdfData, error: pdfError } = await supabase
      .from('pdfs')
      .insert([{ pdf_file: bookId }])
      .single()
      .select();

    if (pdfError) {
      console.error('Error inserting PDF:', pdfError);
      return res.status(500).json({ error: 'Error inserting PDF', details: pdfError.message });
    }

    // Generar JWT con el ID del libro y otros datos si es necesario
    const token = generateToken({ bookId });

    res.json({
      success: true,
      bookId: bookId,
      token // Incluir el token JWT en la respuesta
    });
  });

  writeStream.on('error', (error) => {
    console.error('Error writing PDF:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  });
});

export default router;
