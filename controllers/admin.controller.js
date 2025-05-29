const db = require('../lib/db');

// Listar todos los productos
exports.listarProductos = (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ message: err });
    res.json(results);
  });
};

// Agregar un producto
exports.agregarProducto = (req, res) => {
  const { nombre, descripcion, precio, existencias } = req.body;
  if (!nombre || !descripcion || !precio || !existencias) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }
  db.query(
    'INSERT INTO productos (nombre, descripcion, precio, existencias) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, precio, existencias],
    (err, result) => {
      if (err) return res.status(500).json({ message: err });
      res.status(201).json({ message: 'Producto agregado correctamente' });
    }
  );
};

// Obtener un producto por ID
exports.obtenerProducto = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: err });
    if (!results.length) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(results[0]);
  });
};

// Editar un producto
exports.editarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, existencias } = req.body;
  if (!nombre || !descripcion || !precio || !existencias) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }
  db.query(
    'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, existencias = ? WHERE id = ?',
    [nombre, descripcion, precio, existencias, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err });
      res.json({ message: 'Producto editado correctamente' });
    }
  );
};

// Eliminar un producto
exports.eliminarProducto = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: err });
    res.json({ message: 'Producto eliminado correctamente' });
  });
};

// Listar todos los pedidos
exports.listarPedidos = (req, res) => {
  db.query('SELECT * FROM pedidos', (err, results) => {
    if (err) return res.status(500).json({ message: err });
    res.json(results);
  });
};