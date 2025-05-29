module.exports = (req, res, next) => {
    // Verificar si el usuario es administrador
    if (req.userData && req.userData.rol === 'admin') {
        next(); // Si es admin, continuar con la siguiente función
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
}