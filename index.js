const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.use('/auth', express.static(path.join(__dirname, 'auth')));

// 2. Rutas API
const router = require('./routes/route');
app.use('/api', router);

// Rutas de pedidos
app.use('/api/pedidos', require('./routes/pedido.route'));

// 3. Ruta base (login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth', 'logIn.html'));
});

// Rutas específicas para las páginas de admin y cliente
app.get('/auth/agregar-producto.html', (req, res) => {
    console.log('Sirviendo página de admin...');
    res.sendFile(path.join(__dirname, 'auth', 'agregar-producto.html'));
});

app.get('/auth/productos-cliente.html', (req, res) => {
    console.log('Sirviendo página de cliente...');
    res.sendFile(path.join(__dirname, 'auth', 'productos-cliente.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Error interno del servidor');
});

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));