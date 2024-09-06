import supabase from '../config/supabaseClient.js';

// Obtener todos los clientes
export const getAllCustomers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*'); // Selecciona todos los campos de la tabla

    if (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: 'Error fetching customers', details: error.message });
    }

    console.log('Fetched customers:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Añadir un nuevo cliente
// Refactoriza addCustomer para no enviar respuestas HTTP
export const addCustomer = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address } = req.params;

    // Verificar campos obligatorios
    if (!first_name || !last_name || !email) {
      return { status: 400, error: 'Missing required fields: first_name, last_name, or email' };
    }

    // Insertar cliente en la base de datos
    const { data, error } = await supabase
      .from('customers')
      .insert([{ first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address }])
      .select();

    if (error) {
      console.error('Error adding customer:', error);
      return { status: 500, error: 'Error adding customer', details: error.message };
    }

    if (!data || data.length === 0) {
      console.error('No data returned after insert');
      return { status: 500, error: 'No data returned after insert' };
    }

    console.log('Inserted customer:', data[0]);

    // Devolver éxito y los datos del cliente insertado
    return { status: 201, data: data[0] }; // Devolver el primer (y único) cliente insertado
  } catch (error) {
    console.error('Error in addCustomer:', error);
    return { status: 500, error: 'Internal Server Error', details: error.message };
  }
};



// Actualizar un cliente
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameter: id' });
    }

    const { data, error } = await supabase
      .from('customers')
      .update({ first_name, last_name, email, mobile_phone, country, state_province, postal_code, shipping_address })
      .eq('id', id);

    if (error) {
      console.error('Error updating customer:', error);
      return res.status(500).json({ error: 'Error updating customer', details: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
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
      return res.status(500).json({ error: 'Error deleting customer', details: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


// Buscar un cliente por correo electrónico
// Función para buscar un cliente por correo electrónico y devolver los datos directamente
export const findCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return { status: 400, error: 'Email parameter is required' };
    }

    // Buscar el cliente por email
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('Error details:', error);
      return { status: 500, error: 'Error finding customer by email', details: error.message };
    }

    if (data.length !== 0) {
      return { status: 200, found: true, customer: data };
    } else {
      return { status: 200, found: false };
    }
  } catch (error) {
    console.error('Error in findCustomerByEmail:', error);
    return { status: 500, error: 'Internal Server Error', details: error.message };
  }
};


export const findCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return { status: 400, error: 'ID parameter is required' };
    }

    // Buscar el cliente por id
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .limit(1);

      console.log(data);
      

    if (error) {
      console.error('Error details:', error);
      return { status: 500, error: 'Error finding customer by id', details: error.message };
    }

    if (data.length !== 0) {
      res.status(200).json({ found: true, customer: data });
      // return { status: 200, found: true, customer: data };
    } else {
      return { status: 200, found: false };
    }
  } catch (error) {
    console.error('Error in findCustomerById:', error);
    return { status: 500, error: 'Internal Server Error', details: error.message };
  }
};
