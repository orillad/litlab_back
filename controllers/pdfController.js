import supabase from '../config/supabaseClient.js';
import fs, { truncateSync } from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage() // Use memory storage to handle files in-memory
});

// Insert a new PDF
export const insertPdf = async (req, res) => {
  upload.single('pdf')(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ error: 'Error uploading file', details: err.message });
    }

    try {
      const { buffer, originalname } = req.file;
      const pdfId = uuidv4(); // Generate a unique ID for the PDF

      // Insert the PDF file into Supabase
      const { data, error } = await supabase
        .from('pdfs')
        .insert([{ id: pdfId, pdf_file: buffer, original_name: originalname }]);

      if (error) {
        console.error('Error inserting PDF:', error);
        return res.status(500).json({ error: 'Error inserting PDF', details: error.message });
      }

      res.status(200).json({ message: 'PDF uploaded successfully', data });
    } catch (error) {
      console.error('Error in insertPdf:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
};




// Obtener un título por ID
export const getPdfById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID:", id);

    // Validar el ID
    if (!id) {
      return res.status(400).json({ exists: false, error: 'Invalid ID provided' });
    }

    // Buscar el título en Supabase
    const { data, error } = await supabase
      .from('pdfs') // Cambia el nombre de la tabla si es necesario
      .select('pdf_file') // Selecciona solo el campo pdf_file
      .eq('id', id)
      .single();


      console.log(data);
      

    if (error) {
      console.error('Error fetching title:', error.message);
      return res.status(404).json({ exists: false, error: 'Title not found or error occurred' });
    }

    if (data) {
      // Devolver el contenido del campo pdf_file como texto
      res.status(200).json({
        exists: true,
        title: data.pdf_file // Aquí pdf_file es el texto del título
      });
    } else {
      // Título no existe
      res.status(404).json({ exists: false, error: 'Title not found' });
    }
  } catch (error) {
    console.error('Error in getTitleByID:', error.message);
    res.status(500).json({ exists: false, error: 'Internal Server Error', details: error.message });
  }
};



// Obtener todos los PDFs
export const getAllPdfs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*');

    if (error) {
      console.error('Error fetching PDFs:', error);
      return res.status(500).json({ error: 'Error fetching PDFs', details: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getAllPdfs:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Obtener un PDF por BookID


export const getPdfByName = async (req, res) => {
  try {
    const { bookName } = req.params;
    console.log("Book ID:", bookName);

    // Validate bookName
    if (!bookName) {
      return res.status(400).json({ exists: false, error: 'Invalid bookName provided' });
    }

    // Fetch PDF data from Supabase
    const { data, error } = await supabase
      .from('pdfs')
      .select('pdf_file')
      .eq('pdf_file', bookName)
      .single();

      console.log("DARTAAA");
      console.log(data);
      
      

    if (error) {
      console.error('Error fetching PDF:', error.message);
      return res.status(404).json({ exists: false, error: 'PDF not found or error occurred' });
    }

    if (data && data.pdf_file) {
      // PDF exists
      // return res.status(200).json({ exists: true });
      return { status: 200, exists: true };
    } else {
      // PDF does not exist
      // return res.status(404).json({ exists: false, error: 'PDF not found' });
      return {status: 400, exists: false, error: 'PDF not found'};
    }
  } catch (error) {
    console.error('Error in getPdfById:', error.message);
    return res.status(500).json({ exists: false, error: 'Internal Server Error', details: error.message });
  }
};


