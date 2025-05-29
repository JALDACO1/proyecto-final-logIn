const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const userMiddleware = require('../middleware/users');
const adminMiddleware = require('../middleware/admin');

// Autenticación
router.post('/sign-up', userMiddleware.validateRegister, authCtrl.register);
router.post('/login', authCtrl.login);

// Perfil protegido
router.get('/perfil', userMiddleware.isLoggedIn, authCtrl.perfil);

// Productos (ver y buscar, cualquier usuario autenticado)
router.get('/productos', userMiddleware.isLoggedIn, authCtrl.listarProductos);
router.get('/productos/:id', userMiddleware.isLoggedIn, authCtrl.obtenerProducto);

// Productos (solo admin puede agregar, editar, eliminar)
router.post('/productos', userMiddleware.isLoggedIn, adminMiddleware, authCtrl.agregarProducto);
router.put('/productos/:id', userMiddleware.isLoggedIn, adminMiddleware, authCtrl.editarProducto);
router.delete('/productos/:id', userMiddleware.isLoggedIn, adminMiddleware, authCtrl.eliminarProducto);

// Pedidos (cliente)
router.get('/pedidos', userMiddleware.isLoggedIn, authCtrl.listarPedidosUsuario);
// router.post('/pedidos', userMiddleware.isLoggedIn, authCtrl.crearPedido);

// Clientes (solo admin)
router.get('/clientes', userMiddleware.isLoggedIn, adminMiddleware, authCtrl.listarClientes);

// Compras
router.post('/compras', userMiddleware.isLoggedIn, authCtrl.realizarCompra);

module.exports = router;