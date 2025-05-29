const express = require('express');
const router = express.Router();

const pedidoCtrl = require('../controllers/pedido.controller');
const { isLoggedIn } = require('../middleware/users');

router.use((req, res, next) => {
  console.log('Ruta pedidos recibida:', req.method, req.originalUrl);
  next();
});

// Obtener todos los productos disponibles
router.get('/productos', pedidoCtrl.getProductos);

// Crear un nuevo pedido (carrito) con productos
router.post('/', (req, res, next) => {
  console.log('POST /api/pedidos recibido');
  next();
}, isLoggedIn, pedidoCtrl.crearPedido);

// Obtener pedidos del usuario autenticado
router.get('/mis-pedidos', isLoggedIn, pedidoCtrl.getMisPedidos);

module.exports = router;

