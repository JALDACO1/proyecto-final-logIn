const db = require('../lib/db');

exports.getProductos = (req, res) => {
  db.query('SELECT * FROM productos', (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al obtener productos' });
    res.json(result);
  });
};

exports.crearPedido = (req, res) => {
  const { productos } = req.body;
  const userId = req.userData.id;
  console.log('Intentando crear pedido para usuario:', userId, 'con productos:', productos);

  if (!Array.isArray(productos) || productos.length === 0) {
    console.log('No hay productos en la petición');
    return res.status(400).json({ message: 'Debes enviar productos' });
  }

  db.query(
    'INSERT INTO pedidos (usuario_id, total, fecha) VALUES (?, 0, NOW())',
    [userId],
    (err, result) => {
      if (err) {
        console.log('Error al crear pedido:', err);
        return res.status(500).json({ message: 'Error al crear pedido' });
      }

      const pedidoId = result.insertId;
      console.log('Pedido insertado con id:', pedidoId);

      let total = 0;
      const detalles = [];

      const queries = productos.map(item => {
        return new Promise((resolve, reject) => {
          db.query('SELECT precio, existencias FROM productos WHERE id = ?', [item.producto_id], (err, resPrecio) => {
            if (err || resPrecio.length === 0) {
              console.log('Producto no existe:', item.producto_id);
              return reject(err || 'Producto no existe');
            }
            if (resPrecio[0].existencias < item.cantidad) {
              console.log('No hay suficientes existencias para producto:', item.producto_id);
              return reject('No hay suficientes existencias');
            }

            const precio = resPrecio[0].precio;
            const subtotal = precio * item.cantidad;
            total += subtotal;

            detalles.push([pedidoId, item.producto_id, item.cantidad, subtotal]);
            resolve();
          });
        });
      });

      Promise.all(queries)
        .then(() => {
          console.log('Detalles a insertar:', detalles);
          db.query(
            'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, subtotal) VALUES ?',
            [detalles],
            (err) => {
              if (err) {
                console.log('Error al insertar detalles:', err);
                return res.status(500).json({ message: 'Error al insertar detalles' });
              }

              // Descontar existencias de cada producto
              const updateQueries = productos.map(item => {
                return new Promise((resolve, reject) => {
                  db.query(
                    'UPDATE productos SET existencias = existencias - ? WHERE id = ? AND existencias >= ?',
                    [item.cantidad, item.producto_id, item.cantidad],
                    (err, result) => {
                      if (err) {
                        console.log('Error al actualizar existencias:', err);
                        return reject('Error al actualizar existencias');
                      }
                      if (result.affectedRows === 0) {
                        console.log('No hay suficientes existencias para actualizar producto:', item.producto_id);
                        return reject('No hay suficientes existencias');
                      }
                      resolve();
                    }
                  );
                });
              });

              Promise.all(updateQueries)
                .then(() => {
                  db.query('UPDATE pedidos SET total = ? WHERE id = ?', [total, pedidoId]);
                  console.log('Pedido creado:', pedidoId, 'para usuario:', userId);
                  res.json({ message: 'Pedido creado', pedido_id: pedidoId, total });
                })
                .catch(error => {
                  console.log('Error al actualizar existencias:', error);
                  res.status(400).json({ message: 'Error al actualizar existencias', error });
                });
            }
          );
        })
        .catch((error) => {
          console.log('Error al procesar pedido:', error);
          res.status(400).json({ message: 'Error al procesar pedido', error });
        });
    }
  );
};

exports.getMisPedidos = (req, res) => {
  const userId = req.userData.id;

  db.query(
    `SELECT p.id, p.fecha, p.total, dp.producto_id, dp.cantidad, dp.subtotal, pr.nombre AS producto_nombre
     FROM pedidos p
     JOIN detalle_pedidos dp ON dp.pedido_id = p.id
     JOIN productos pr ON pr.id = dp.producto_id
     WHERE p.usuario_id = ?
     ORDER BY p.fecha DESC, p.id DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error SQL getMisPedidos:', err);
        return res.status(500).json({ message: 'Error al recuperar pedidos', error: err });
      }

      // Agrupar por pedido
      const pedidosMap = {};
      rows.forEach(row => {
        if (!pedidosMap[row.id]) {
          pedidosMap[row.id] = {
            id: row.id,
            fecha: row.fecha,
            total: row.total,
            productos: []
          };
        }
        pedidosMap[row.id].productos.push({
          producto_id: row.producto_id,
          nombre: row.producto_nombre,
          cantidad: row.cantidad,
          subtotal: row.subtotal
        });
      });

      // Convertir el objeto a array
      const pedidos = Object.values(pedidosMap);

      res.json({ pedidos });
    }
  );
};
