const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const { isLoggedIn } = require('../middleware/users');
const adminMiddleware = require('../middleware/admin');

// Obtener todos los productos disponibles
router.get('/productos', isLoggedIn, adminCtrl.listarProductos);
// Crear un nuevo producto
router.post('/productos', isLoggedIn, adminMiddleware, adminCtrl.agregarProducto);
// Obtener un producto por ID
router.get('/productos/:id', isLoggedIn, adminCtrl.obtenerProducto);
// Editar un producto por ID
router.put('/productos/:id', isLoggedIn, adminMiddleware, adminCtrl.editarProducto);
// Eliminar un producto por ID
router.delete('/productos/:id', isLoggedIn, adminMiddleware, adminCtrl.eliminarProducto);
// Obtener todos los pedidos
router.get('/pedidos', isLoggedIn, adminMiddleware, adminCtrl.listarPedidos);

module.exports = router;