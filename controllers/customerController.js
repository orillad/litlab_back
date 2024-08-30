import supabase from '../config/supabaseClient.js';

// Obtener todos los clientes
export const getAllCustomers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*'); // Selecciona todos los campos de la tabla

    if (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Fetched customers:', data);
    res.json(data);
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Añadir un nuevo cliente
export const addCustomer = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address, book } = req.body;

    // Asegúrate de que todos los campos requeridos estén presentes
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, or email' });
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{ first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address, book }]);

    if (error) {
      console.error('Error adding customer:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in addCustomer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un cliente
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address, book } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const { data, error } = await supabase
      .from('customers')
      .update({ first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address, book })
      .eq('id', id);

    if (error) {
      console.error('Error updating customer:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un cliente
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    res.status(500).json({ error: error.message });
  }
};
