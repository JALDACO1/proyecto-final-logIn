const express = require('express');
const router = express.Router();
const productosCtrl = require('../controllers/productos.controller');
const { isLoggedIn } = require('../middleware/users');

//listar productos
router.get('/', isLoggedIn, productosCtrl.listarProductos);
// Obtener un producto por ID
router.get('/:id', isLoggedIn, productosCtrl.obtenerProducto);
module.exports = router;