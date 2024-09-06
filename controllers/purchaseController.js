import supabase from '../config/supabaseClient.js';
import fs from 'fs';
import path from 'path';

// Crear una nueva compra con un PDF
export const createPurchase = async (req, res) => {
  try {
    // Verifica que req y res no sean undefined
    if (!req || !res) {
      throw new Error('Request or response object is missing');
    }

    const { customerId, bookId } = req.body;
    console.log('Creating purchase for customer:', customerId);

    // Insertar el PDF en la tabla pdfs
    const { data: pdfData, error: pdfError } = await supabase
    .from('pdfs')
    .select('*') 
    .eq('pdf_file', bookId) 
    .single(); 
  
  if (pdfError) {
    console.error('Error selecting PDF:', pdfError);
    return res.status(500).json({ error: 'Error selecting PDF', details: pdfError.message });
  }
  

    // Insertar la compra en la tabla purchases
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          customer_id: customerId,
          pdf_id: pdfData.id,
        }
      ]);

    if (error) {
      console.error('Error creating purchase:', error);
      return res.status(500).json({ error: 'Error creating purchase', details: error.message });
    }

    return {data: data};
  } catch (error) {
    console.error('Error in createPurchase:', error);
    // Asegúrate de que res esté definido
    if (res && !res.headersSent) {
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
};

// Obtener todas las compras de un cliente
export const getPurchases = async (req, res) => {
  try {

    const { data, error } = await supabase
      .from('purchases')
      .select(`
        id,
        customer_id,
        purchase_date,
        pdf_id
      `)

    if (error) {
      console.error('Error fetching purchases:', error);
      return res.status(500).json({ error: 'Error fetching purchases', details: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getPurchasesr:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


export const getPurchasesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data, error } = await supabase
      .from('purchases')
      .select(`
        id,
        purchase_date,
        details,
        pdfs ( pdf_file )
      `)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error fetching purchases:', error);
      return res.status(500).json({ error: 'Error fetching purchases', details: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getPurchasesByCustomer:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Obtener un PDF asociado a una compra
export const getPdfByPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases')
      .select('pdf_id')
      .eq('id', purchaseId)
      .single();

    if (purchaseError) {
      console.error('Error fetching purchase:', purchaseError);
      return res.status(500).json({ error: 'Error fetching purchase', details: purchaseError.message });
    }

    const { data: pdfData, error: pdfError } = await supabase
      .from('pdfs')
      .select('pdf_file')
      .eq('id', purchaseData.pdf_id)
      .single();

    if (pdfError) {
      console.error('Error fetching PDF:', pdfError);
      return res.status(500).json({ error: 'Error fetching PDF', details: pdfError.message });
    }

    // Guardar el archivo PDF en el sistema de archivos local
    const filePath = path.join(__dirname, 'downloaded_file.pdf');
    fs.writeFileSync(filePath, Buffer.from(pdfData.pdf_file));

    res.status(200).sendFile(filePath);
  } catch (error) {
    console.error('Error in getPdfByPurchase:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Actualizar una compra
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, pdfId, details } = req.body;

    const { data, error } = await supabase
      .from('purchases')
      .update({ customer_id: customerId, pdf_id: pdfId, details })
      .eq('id', id);

    if (error) {
      console.error('Error updating purchase:', error);
      return res.status(500).json({ error: 'Error updating purchase', details: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in updatePurchase:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Eliminar una compra
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    // Eliminar la compra
    const { data, error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting purchase:', error);
      return res.status(500).json({ error: 'Error deleting purchase', details: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error in deletePurchase:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
