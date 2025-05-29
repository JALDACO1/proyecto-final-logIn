const db = require('../lib/db');

exports.listarProductos = (req, res) => {
    db.query('select * from productos',(err, results) => {
        if (err) return res.status(500).json({ message: err });
        res.json(results);
    })
}
exports.obtenerProducto = (req, res) => {
    const { id } = req.params;
    db.query('select * from productos where id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: err });
        if (!results.length) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(results[0]);
    })
}