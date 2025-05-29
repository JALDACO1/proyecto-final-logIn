// user.js  (middleware)
const jwt = require('jsonwebtoken');

module.exports = {

    validateRegister: (req, res, next) => {
    const { nombre, contrasena } = req.body;

    // Validar username
    if (!nombre || nombre.length < 3) {
      return res.status(400).json({
        message: 'El nombre debe tener al menos 3 caracteres'
      });
    }

    // Validar password
    if (!contrasena || contrasena.length < 3) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 3 caracteres'
      });
    }

    next(); // si esta todo bien, continuar
  },

  // ───────────────────────────────────────────────
  isLoggedIn: (req, res, next) => {
    console.log('Middleware isLoggedIn ejecutado');
    // Debe venir Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Sesión no válida (token faltante)' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'SECRETKEY'); // Usa tu misma clave secreta
      req.userData = decoded;           
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Sesión no válida (token incorrecto)' });
    }
  }
};
