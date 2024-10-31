// import axios from "axios";
import dotenv from 'dotenv';
import { updatePurchaseState } from "./controllers/purchaseController.js";
import { sendEmail } from "./mail/sendEmail.js";
import axios from './utils/axios.js';
import { v4 as uuidv4 } from 'uuid'; // Llibreria per generar tokens únics

import latex from 'node-latex';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
dotenv.config();
// import multer from "multer";
console.log("__________________________");
console.log("THIS IS TESTING\n");

// const customer = {
//     "first_name": "wer",
//     "last_name": "fsd",
//     "email": "xcv@sdf.com",
//     "mobile_phone": "fds",
//     "country": "asfddfs",
//     "state_province": "sdf",
//     "postal_code": "fsdsdf",
//     "shipping_address": "dsffds"
// }  

// const result = await addCustomer(customer)

// console.log(result);


// console.log("HOLA SAÜC, jo soc loriol");


// index.js o app.js


// Llamada para enviar un correo
const templatePath = './mail/templates/test.ejs'; // Ruta a la plantilla EJS
const usr_mail = 'orillad2003@gmail.com'; // Correo destinatario
const subject = 'Welcome to LitLab Books'; // Asunto del correo
const templateData = { name: 'Oriol', book_title: "L'Oriol va a esquiar a Val Thorens", download_link:"test" }; // Datos para la plantilla
console.log("Sendig");


// sendEmail(templatePath, usr_mail, subject, templateData);

// console.log("Sendig");


// Llegeix el fitxer LaTeX
// const fs = require('fs');


// // Exemple de JSON
// const data = {
//     "title": "La meva primera història",
//     // "autor": "Joan Fabre",
//     "contingut": [
//         {
//             "capitol": 1,
//             "titol_capitol": "Un inici increïble",
//             "paragrafs": [
//                 "Era una vegada en un poble molt petit...",
//                 "Els dies passaven i el poble creixia..."
//             ]
//         },
//         {
//             "capitol": 2,
//             "titol_capitol": "Una aventura inesperada",
//             "paragrafs": [
//                 "Un dia, un misteriós viatger va arribar...",
//                 "Els habitants del poble estaven intrigats..."
//             ]
//         }
//     ]
// };

// // Funció per generar el contingut de capítols
// function generateCapitols(contingut) {
//     return contingut.map(capitol => {
//         let cap = `\\section*{${capitol.titol_capitol}}\n`;
//         cap += capitol.paragrafs.map(paragraf => `${paragraf}\n`).join('\n');
//         return cap;
//     }).join('\n');
// }

// // Llegeix la plantilla
// fs.readFile('test.tex', 'utf8', (err, template) => {
//     if (err) {
//         console.error('Error llegint la plantilla:', err);
//         return;
//     }

//     // Omple la plantilla amb el contingut
//     const capitols = generateCapitols(data.contingut);
//     const output = template
//         .replace('TITLE', data.title)
//     // .replace('AUTOR', data.autor)
//     // .replace('CAPITOLS', capitols);

//     // Escriure el contingut en un fitxer .tex
//     const latexFileName = 'historia.tex'; // Nom del fitxer de sortida
//     fs.writeFile(latexFileName, output, (err) => {
//         if (err) {
//             console.error('Error escrivint el fitxer:', err);
//         } else {
//             console.log(`Fitxer LaTeX generat amb èxit: ${latexFileName}`);
//             const inputPath = latexFileName;

//             exec(`pdflatex ${inputPath}`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`Error al generar el PDF: ${error.message}`);
//                     return;
//                 }
//                 if (stderr) {
//                     console.error(`Error: ${stderr}`);
//                     return;
//                 }
//                 console.log(`PDF generat correctament: ${stdout}`);

//                 // Eliminar fitxers auxiliars
//                 const auxFiles = ['historia.aux', 'historia.log', 'historia.out']; // Fitxers auxiliars generats
//                 auxFiles.forEach(file => {
//                     fs.unlink(file, (err) => {
//                         if (err) {
//                             console.error(`Error eliminant fitxer ${file}: ${err}`);
//                         } else {
//                             console.log(`Fitxer eliminat: ${file}`);
//                         }
//                     });
//                 });
//             });
//         }
//     });
// });


// Enviar el correo


// const getDownloadLink = async (bookName) => {
//     try {
//       console.log(bookName);

//       // Realiza una solicitud GET al endpoint del backend
//       const response = await axios.get(`http://localhost:3000/book/get-download-link/${bookName}`);

//       if (response.status === 200 && response.data.url) {
//         // Retorna la URL de descarga si está disponible
//         return response.data.url;
//       } else {
//         console.error('El enlace de descarga no está disponible:', response.data.message);
//         return null;
//       }
//     } catch (error) {
//       console.error('Error al obtener el enlace de descarga:', error.message);
//       if (error.response) {
//         console.error('Detalles de la respuesta del servidor:', error.response.data);
//       }
//       return null;
//     }
//   };
//   const bookName = "L'Extraordinària_Odissea_de_Josep:_Un_Alienígena_en_Cerca_d'Amistat"

//   await getDownloadLink(bookName)
// const token = uuidv4();

console.log("__________________________");

//TABLES