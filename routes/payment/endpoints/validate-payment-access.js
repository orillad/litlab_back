import { Router } from 'express';
const router = Router();
import { verifyToken } from '../../../utils/jwt.js';
import { getBookByName } from '../../../controllers/BookController.js'; // Ajusta la ruta a donde esté tu función getPdfById

// Endpoint para validar el acceso al pago
router.post('/validate-payment-access', async (req, res) => {
  const { bookName, token } = req.body;
  console.log("HOLAAAAA");
  console.log("bookName in validate-payment");
  console.log(bookName);
  
  


  try {
    // Validar el JWT
    const decoded = verifyToken(token);
    

    // Verificar si el PDF asociado al bookName es válido
    const pdfResponse = await checkBookExists(bookName);

    if (!pdfResponse) {
      // return res.status(404).json({ isValid: false, message: 'PDF no encontrado' });
      return {status: 404, isValid: false, message: 'PDF not found'};
    }

    // Puedes añadir lógica adicional aquí, como verificar roles o permisos específicos
    return res.status(200).json({ isValid: true, message: 'Acceso permitido' });
    // return {staus: 200, isValid: true, message: 'Acces garated'};
  } catch (error) {
    return {status: 401, isValid: false, message: 'Token not valid or expired'};
    // return res.status(401).json({ isValid: false, message: 'Token inválido o expirado' });
  }
});

// Función auxiliar para verificar la existencia del PDF
const checkBookExists = async (bookName) => {
  try {
    // Simular una llamada a getPdfById para verificar la existencia del PDF
    const response = await getBookByName({ params: { bookName } });
    console.log("RESPOMNSEE");
    
    console.log(response);
    
    return response.exist;
  } catch (error) {
    console.error('Error en checkPdfExists:', error);
    return { exists: false };
  }
};

export default router;
