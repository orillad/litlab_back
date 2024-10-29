import { Router } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { generateToken } from '../../../utils/jwt.js'; // Importa la función para generar JWT
import supabase from '../../../config/supabaseClient.js';
import { fileURLToPath } from 'url';
import { insertBook } from '../../../controllers/BookController.js';
import axios from '../../../utils/axios.js';
import { getPurchaseByBookName } from '../../../controllers/purchaseController.js';
import { findCustomerById } from '../../../controllers/customerController.js';
import { sendEmail } from '../../../mail/sendEmail.js';


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

let currentPage = 1; // Inicia el número de pàgina


// console.log(fonts);


const getFontForLanguage = (language) => {
  return fonts[language] || path.join(projectRoot, 'fonts/NotoSans-VariableFont_wdth,wght.ttf'); // Usa una font predeterminada si no hi ha coincidència
};


// Función para descargar una imagen desde una URL y convertirla en un buffer
const downloadImageAsBuffer = async (imageUrl) => {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to fetch image');
  return await response.buffer();
};

const addCoverPage = (doc, title, lang) => {
  // Dibuixa un rectangle que cobreixi tota la pàgina
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#113A3A');

  // Afegir el text
  doc.fillColor('#FED0CE').fontSize(18).font('Times-Roman').text('Create, dream, and educate.', {
    align: 'center',
  });
  doc.moveDown(12); // Este moveDown es correcto, controla si es necesario

  const fontPath = getFontForLanguage(lang);

  // Afegeix el títol i centra'l verticalment
  const titleHeight = doc.heightOfString(title, { font: fontPath, fontSize: 42 });
  const pageHeight = doc.page.height;

  doc.fillColor('#FED0CE').fontSize(42).font(fontPath).text(title, {
    align: 'center',
    valign: 'center',
    x: doc.page.width / 2,
    y: (pageHeight - titleHeight) / 2 // Calcula la posició Y per centrar el títol
  });

  // Afegir la imatge a la part inferior de la pàgina
  const logoPath = './public/images/logo.png'; // Ruta de la imatge
  const logoHeight = 50; // Alçada de la imatge
  const logoWidth = 100; // Amplada de la imatge
  const logoYPosition = pageHeight - logoHeight - 20; // 20 píxels d'espai del fons

  // Centrar la imatge horitzontalment
  const logoXPosition = (doc.page.width - logoWidth) / 2;

  doc.image(logoPath, {
    fit: [logoWidth, logoHeight], // Ajusta la mida de la imatge
    align: 'center',
    valign: 'bottom',
    x: logoXPosition, // Posició X centrada
    y: logoYPosition
  });

  // Afegir una nova pàgina
  doc.addPage({ size: 'A4', margins: { top: 0, bottom: 0, left: 60, right: 60 } }); // Estableix marges a zero a la nova pàgina
};

const addFinalPage = (doc, title, lang) => {
  // Dibuixa un rectangle que cobreixi tota la pàgina
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#113A3A');

  // Afegir el text
  doc.fillColor('#FED0CE').fontSize(18).font('Times-Roman').text(title, {
    align: 'left',
  });
  doc.moveDown(12); // Este moveDown es correcto, controla si es necesario

  const fontPath = getFontForLanguage(lang);

  // Afegeix el títol i centra'l verticalment
  const titleHeight = doc.heightOfString(title, { font: fontPath, fontSize: 42 });
  const pageHeight = doc.page.height;

  doc.fillColor('#FED0CE').fontSize(42).font(fontPath).text("END.", {
    align: 'left',
    valign: 'center',
    x: doc.page.width / 2,
    y: (pageHeight - titleHeight) / 2 // Calcula la posició Y per centrar el títol
  });

  // Afegir la imatge a la part inferior de la pàgina
  const logoPath = './public/images/logo.png'; // Ruta de la imatge
  const logoHeight = 50; // Alçada de la imatge
  const logoWidth = 100; // Amplada de la imatge
  const logoYPosition = pageHeight - logoHeight - 20; // 20 píxels d'espai del fons

  // Centrar la imatge horitzontalment
  const logoXPosition = (doc.page.width - logoWidth) / 2;

  doc.image(logoPath, {
    fit: [logoWidth, logoHeight], // Ajusta la mida de la imatge
    align: 'center',
    valign: 'bottom',
    x: logoXPosition, // Posició X centrada
    y: logoYPosition
  });

  // Afegir una nova pàgina
  doc.addPage(); 
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#113A3A');
};



const addChapter = async (doc, chapter, lang, chapterNumber) => {

  
  const fontPath = getFontForLanguage(lang);
  console.log('Font path:', fontPath);

  const title = chapter.title.split(":");
  console.log('Title parts:', title);


  if(chapterNumber % 2 != 0){
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FED0CE'); 

    const pageHeight = doc.page.height; 
    const totalHeight = title.length > 1 ? 6 : 30; 
  
    const offset = 70;
    const startY = (pageHeight - totalHeight) / 2 - offset;
  
    doc.y = startY;
  
    if (title.length > 1) {
      doc.fontSize(20).font(fontPath).fillColor('#113A3A').text(title[0], { align: 'center' });
      doc.fontSize(30).font(fontPath).fillColor('#113A3A').text(title[1], { align: 'center' });
    } else {
      doc.fontSize(30).font(fontPath).fillColor('#113A3A').text(title[0], { align: 'center' });
    }
  
  
    doc.addPage();
  }else{
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#113A3A'); 

    const pageHeight = doc.page.height; 
    const totalHeight = title.length > 1 ? 6 : 30; 
  
    const offset = 70;
    const startY = (pageHeight - totalHeight) / 2 - offset;
  
    doc.y = startY;
  
    if (title.length > 1) {
      doc.fontSize(20).font(fontPath).fillColor('#FED0CE').text(title[0], { align: 'center' });
      doc.fontSize(30).font(fontPath).fillColor('#FED0CE').text(title[1], { align: 'center' });
    } else {
      doc.fontSize(30).font(fontPath).fillColor('#FED0CE').text(title[0], { align: 'center' });
    }
  
  
    doc.addPage();
  }




  doc.rect(0, 0, 595.276, 841.890).fill('#FFFFFF');

  // Afegir el text del capítol
  console.log('Adding chapter text:', chapter.text);
  doc.fontSize(14).font(fontPath).fillColor('#113A3A').text(chapter.text, {
    align: 'justify'
  });



  doc.moveDown(5);

  // Espai addicional abans de la imatge
  // doc.moveDown(2);


  if (chapter.imageUrl) {
    try {
      // Descarregar la imatge com a buffer
      const imageBuffer = await downloadImageAsBuffer(chapter.imageUrl);

      // Verificar el tamany de la imatge per decidir si cap a la pàgina
      const image = doc.openImage(imageBuffer);
      const imageWidth = image.width;
      const imageHeight = image.height;

      const margins = { top: 50, bottom: 50, left: 60, right: 60 };
      const pageWidth = 595.276; // Amplada de la pàgina A4 en punts
      const pageHeight = 841.890; // Alçada de la pàgina A4 en punts

      // Ajustar tamany de la imatge per a que s'ajusti a la pàgina si és necessari
      let fitWidth = pageWidth - margins.left - margins.right;
      let fitHeight = pageHeight - margins.top - margins.bottom;

      let scale = Math.min(fitWidth / imageWidth, fitHeight / imageHeight);

      // Reduir la imatge mantenint la seva relació d'aspecte
      let scaledWidth = imageWidth * scale;
      let scaledHeight = imageHeight * scale;

      // Afegir marge addicional si la imatge és massa gran
      const maxImageHeight = pageHeight - margins.top - margins.bottom - 50; // Ajustar el valor segons sigui necessari
      if (scaledHeight > maxImageHeight) {
        scale = maxImageHeight / imageHeight;
        scaledWidth = imageWidth * scale;
        scaledHeight = imageHeight * scale;
      }

      const xPos = (pageWidth - scaledWidth) / 2;
      let yPos = doc.y;

      // Verificar si la imatge cap a la pàgina actual
      if (yPos + scaledHeight > pageHeight - margins.bottom) {
        // doc.fontSize(15).font(fontPath).fillColor('#113A3A').text(currentPage, 550, 800, { align: 'right' });
        // doc.fontSize(15).font(fontPath).fillColor('#113A3A').text(title[1], 40, 800, { align: 'left' });

        doc.addPage({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });

        // currentPage++;

        yPos = margins.top; // Reset position vertical per a la nova pàgina
      }

      doc.image(imageBuffer, xPos, yPos, {
        width: scaledWidth,
        height: scaledHeight,
        align: 'center',
        valign: 'top'
      });


      // doc.fontSize(15).font(fontPath).fillColor('#113A3A').text(currentPage, 550, 800, { align: 'right' });
      // doc.fontSize(15).font(fontPath).fillColor('#113A3A').text(title[1], 40, 800, { align: 'left' });

      // Ajustar posició vertical després de la imatge
      doc.addPage();
      // currentPage++;


    } catch (error) {
      console.error('Error loading image:', error);
    }
  }

  doc.moveDown(2);
};


const chatGpt = async (prompt) => {
  try {
    const response = await axios.post('/gpt/chat', { prompt });
    if (response.data) {
      let cleanTitle = response.data.response;
      cleanTitle = cleanTitle.replace(/^"|"$/g, '');
      cleanTitle = cleanTitle.replace(/\\"/g, '"');
      return cleanTitle;
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};

const dalle = async (prompt) => {
  try {
    // Hacer la solicitud POST al endpoint con el prompt
    const response = await axios.post('/gpt/dalle', { prompt });

    // Extraer la URL de la imagen del objeto JSON recibido
    const { imageUrl } = response.data;

    // Retornar la URL de la imagen
    return imageUrl;
  } catch (e) {
    // Manejar errores y mostrar en la consola
    console.log("ERROR:");
    console.log(e);
    return e;
  }
};


const generateBook = async (title, chapters, lang) => {
  try {
    console.log('Title:', title); // Verify title.value is correct

    const jsonResult = JSON.stringify({ title, chapters, lang });
    console.log(jsonResult);

    const response = await axios.post('/book/generate-book', {
      title, // Ensure title is a string
      chapters,
      lang
    });

    if (response.data.success) {
      return response.data;
    } else {
      console.error('Server error:', response.data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response received:', error.request);
    }
  }
};

// Endpoint para generar el libro
router.post('/generate-book', async (req, res) => {
  const { title, chapters, lang } = req.body;

  if (!title || !Array.isArray(chapters)) {
    return res.status(400).json({ success: false, message: 'Invalid title or chapters format' });
  }
  const bookName = title.replace(/\s+/g, '_')

  const doc = new PDFDocument({ size: 'A4', layout: 'portrait', bufferPages: true });
  const filePath = path.join(baseDir, `${title.replace(/\s+/g, '_')}.pdf`);
  const writeStream = fs.createWriteStream(filePath);
  let pageNumber = 1;

  doc.pipe(writeStream);

  console.log(chapters);


  // Agregar portada
  addCoverPage(doc, title, lang);

  let chapterNumber = 1

  for (const chapter of chapters) {
    // Separar el títol del text
    const [title, ...restOfText] = chapter.text.split('\n'); // Suposant que el títol està a la primera línia
    const text = restOfText.join('\n'); // Unir la resta del text

    // Crear un nou objecte chapter amb el títol separat
    const chapterWithSeparatedTitle = {
      ...chapter,
      title, // El títol separat
      text,  // La resta del text
    };

    await addChapter(doc, chapterWithSeparatedTitle, lang, chapterNumber);
    chapterNumber++;
  }
  // doc.addPage();
  addFinalPage(doc, title, lang)

  addPageNumber(doc);


  doc.end();

  function addPageNumber(doc) {
    const range = doc.bufferedPageRange();
    console.log(range);

    for (let i = range.start + 1; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(15)
        .text(i, 550, 800, {
          continued: true,
          align: 'right'
        });
    }
  }

  // doc.fontSize(15).font(fontPath).fillColor('#113A3A').text(currentPage, 550, 800, { align: 'right' });

  // Esperar a que el archivo se haya guardado
  writeStream.on('finish', async () => {

    // Insertar el PDF en la tabla pdfs
    // Generar JWT con el ID del libro y otros datos si es necesario
    const token = generateToken({ bookName });

    res.json({
      success: true,
      bookName: bookName,
      token // Incluir el token JWT en la respuesta
    });
  });

  writeStream.on('error', (error) => {
    console.error('Error writing PDF:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  });
});


const getDownloadLink = async (bookName) => {
  try {
    console.log(bookName);

    // Realiza una solicitud GET al endpoint del backend
    const response = await axios.get(`/book/get-download-link/${bookName}`);

    if (response.status === 200 && response.data.url) {
      // Retorna la URL de descarga si está disponible
      return response.data.url;
    } else {
      console.error('El enlace de descarga no está disponible:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Error al obtener el enlace de descarga:', error.message);
    if (error.response) {
      console.error('Detalles de la respuesta del servidor:', error.response.data);
    }
    return null;
  }
};

router.post('/create-book', async (req, res) => {
  const { title, summary, isChildrensBook, protagonists, selectedLanguage, bookFormat } = req.body;
  const bookName = title.replace(/\s+/g, '_')
  insertBook(bookName, bookFormat);



  const generatePromptForChapter = (chapterNumber) => {
    const prompt = isChildrensBook
      ? `Create Chapter ${chapterNumber} of a fun and colorful children's story in ${selectedLanguage}! Here are some guidelines:
      - Each chapter should have at least 50 words.
      - Use simple language and funny characters that make kids laugh and smile.
      - Include lots of dialogue and exciting, imaginative situations.
      - Make sure there's a valuable lesson or a nice message at the end of the story.`
      : `Generate Chapter ${chapterNumber} of an extensive story in ${selectedLanguage} based on the following details:
      - Each chapter should be a minimum of 2000 words.
      - Include detailed character development, rich descriptions, and substantial dialogue.
      - Explore both internal and external conflicts.
      - Ensure a coherent narrative style and tone with a clear evolution of plot and characters.`;

    return `${prompt}
    - Is it a children's book?: ${isChildrensBook}
    - Protagonists (in order of importance, from main protagonist to lesser roles): ${protagonists.map(p => `${p.name}`).join(', ')}
    - Summary: ${summary}
    - Suggested title: ${title ? title : 'No title has been generated yet'}`;
  }


  const summarizeChapterText = async (chapterText) => {
    const summaryPrompt = `Summarize the following text into a concise description suitable for generating an image: ${chapterText}`;
    const summaryResponse = await chatGpt(summaryPrompt);
    return summaryResponse;
  }

  const generateImageForChapter = async (chapterText, chapterNumber) => {
    const summarizedText = await summarizeChapterText(chapterText);

    const artStyle = isChildrensBook
      ? "whimsical and colorful, suitable for children's illustrations, with soft lines and bright colors"
      : "realistic and sophisticated, with detailed textures and a more muted color palette";

    const promptForImage = `Create a detailed image that visually represents the key themes and atmosphere of Chapter ${chapterNumber} of a story. Focus on capturing the essence and mood of the described scenes without including any text or written elements. The image should convey the narrative elements effectively, using the following description as inspiration: ${summarizedText}. Ensure that the final artwork purely reflects the chapter's essence through visual storytelling in a ${artStyle}.`;

    // Llama a la API para obtener la URL de la imagen
    const imageUrl = await dalle(promptForImage);

    console.log(imageUrl);
    return imageUrl;
  }


  const generateChapter = async (chapterNumber) => {
    const prompt = generatePromptForChapter(chapterNumber);
    console.log(prompt);
    const response = await chatGpt(prompt);

    // Generar la imagen para el capítulo
    const imageUrl = await generateImageForChapter(response, chapterNumber);

    console.log(imageUrl);

    return { text: response, imageUrl };
  }

  try {

    const chapters = [];
    const totalChapters = 2; // Número de capítulos a generar


    for (let i = 1; i <= totalChapters; i++) {
      const chapter = await generateChapter(i);
      chapters.push(chapter);
      console.log("Chapter", i, "Generated");

      // chapterNumberSpin.value++; // Incrementa el número de capítulo mostrado en el spinner
    }

    // Genera el libro después de obtener todos los capítulos
    const response = await generateBook(title, chapters, selectedLanguage);

    if (response.success) {
      console.log("Response of generateBOOK");
      console.log(response);

      // Verificar si la compra existeix a la base de dades
      const purchase = await getPurchaseByBookName(response.bookName)

      if (purchase.found) {
        try {

          const client = await axios.get(`/api/customers/${purchase.data.customer_id}`);
          console.log(client);

          if (client.data.found) {
            console.log(client.data.customer);

            const email = client.data.customer.email; // Obteniu l'email del client de la compra
            const templatePath = './mail/templates/download.ejs'; // Ruta a la plantilla EJS
            const subject = 'Your book is available for download'; // Email subject
            const templateData = { name: client.data.customer.first_name, book_title: title, download_link: await getDownloadLink(bookName) }; // Dades per a la plantilla

            // Enviar el correu
            await sendEmail(templatePath, email, subject, templateData);
            console.log('Download email sent to:', email);

          } else {
            console.log("Client not found");

          }

        } catch (error) {
          console.error('Failed to load customer details:', error);
        }
        console.log('Purchase found:', purchase);

      } else {
        console.error('Purchase not found for book ID:', response.bookId);
      }
    } else {
      console.error('Error generating the book on the server');
    }
  } catch (error) {
    console.error('Error generating story or image:', error);
  }


});



export default router;


