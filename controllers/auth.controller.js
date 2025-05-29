const db = require('../lib/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ----------- AUTENTICACIÓN Y USUARIOS -----------

exports.register = (req, res) => {
  // Incluye rol en la desestructuración
  const { nombre, apellido, correo, contrasena, rfc, direccion, rol } = req.body;
  db.query(
    'SELECT id FROM usuarios WHERE LOWER(nombre) = LOWER(?)',
    [nombre],
    (err, result) => {
      if (err) return res.status(500).send({ message: err });
      if (result && result.length) {
        return res.status(409).send({ message: '¡Nombre de usuario en uso!' });
      }

      bcrypt.hash(contrasena, 10, (err, hash) => {
        if (err) return res.status(500).send({ message: err });


        db.query(
          'INSERT INTO usuarios (nombre, apellido, correo, contrasena, rfc, direccion, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [nombre, apellido, correo, hash, rfc, direccion, rol || 'cliente'],
          (err) => {
            if (err) return res.status(400).send({ message: err });
            return res.status(201).send({ message: '¡Usuario registrado!' });
          }
        );
      });
    }
  );
};

exports.login = (req, res) => {
  const { nombre, contrasena } = req.body;

  db.query(
    'SELECT * FROM usuarios WHERE nombre = ?',
    [nombre],
    (err, users) => {
      if (err || !users || users.length === 0) {
        return res.status(400).send({ message: 'Usuario o contraseña incorrectos' });
      }

      const user = users[0];

      bcrypt.compare(contrasena, user.contrasena, (err, isMatch) => {
        if (!isMatch) {
          return res.status(400).send({ message: 'Usuario o contraseña incorrectos' });
        }

        // Incluye el rol en el token si tu tabla usuarios tiene el campo 'rol'
        const token = jwt.sign(
          { id: user.id, nombre: user.nombre, rol: user.rol },
          'SECRETKEY',
          { expiresIn: '7d' }
        );

        res.status(200).send({
          message: '¡Inicio de sesión exitoso!',
          token,
          user: { id: user.id, nombre: user.nombre, rol: user.rol }
        });
      });
    }
  );
};

exports.perfil = (req, res) => {
  res.send({ message: 'Este es tu perfil', user: req.userData });
};

// ------------------- CRUD PRODUCTOS -------------------

exports.agregarProducto = (req, res) => {
  const { nombre, descripcion, precio, existencias } = req.body;

  if (!nombre || !descripcion || !precio || !existencias) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO productos (nombre, descripcion, precio, existencias) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, descripcion, precio, existencias], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err });
    }
    res.status(201).json({ message: 'Producto agregado correctamente' });
  });
};

exports.listarProductos = (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      return res.status(500).json({ message: err });
    }
    res.json(results);
  });
};

exports.obtenerProducto = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err });
    }
    if (!results.length) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(results[0]);
  });
};

exports.editarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, existencias } = req.body;

  if (!nombre || !descripcion || !precio || !existencias) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, existencias = ? WHERE id = ?';
  db.query(sql, [nombre, descripcion, precio, existencias, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err });
    }
    res.json({ message: 'Producto editado correctamente' });
  });
};

exports.eliminarProducto = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  });
};

// ------------------- PEDIDOS (FUNCIONES VACÍAS PARA QUE NO FALLE) -------------------

exports.listarPedidosUsuario = (req, res) => {
  res.json([]); // Implementa la lógica real después
};

exports.crearPedido = (req, res) => {
  res.json({ message: 'Pedido creado (demo)' }); // Implementa la lógica real después
};

// ------------------- CLIENTES (ADMIN, FUNCIÓN VACÍA) -------------------

exports.listarClientes = (req, res) => {
  res.json([]); // Implementa la lógica real después
};

// --- Realizar compra ---
exports.realizarCompra = (req, res) => {
    const items = req.body.items; // [{ productoId, cantidad }]
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No hay productos en la compra' });
    }

    // Iniciar transacción
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: 'Error al iniciar la transacción' });

        // Verificar existencias y actualizar
        const verificarYActualizar = items.map(item => {
            return new Promise((resolve, reject) => {
                db.query('SELECT existencias FROM productos WHERE id = ?', [item.productoId], (err, results) => {
                    if (err || results.length === 0) return reject('Producto no encontrado');
                    if (results[0].existencias < item.cantidad) return reject('No hay suficientes existencias de ' + item.productoId);

                    // Descontar existencias
                    db.query('UPDATE productos SET existencias = existencias - ? WHERE id = ?', [item.cantidad, item.productoId], (err2) => {
                        if (err2) return reject('Error al actualizar existencias');
                        resolve();
                    });
                });
            });
        });

        Promise.all(verificarYActualizar)
            .then(() => {
                db.commit(err => {
                    if (err) {
                        db.rollback(() => {});
                        return res.status(500).json({ message: 'Error al confirmar la compra' });
                    }
                    res.json({ message: '¡Compra realizada con éxito!' });
                });
            })
            .catch(errMsg => {
                db.rollback(() => {});
                res.status(400).json({ message: errMsg });
            });
    });
};