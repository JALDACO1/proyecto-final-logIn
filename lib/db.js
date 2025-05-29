const mysql = require('mysql2');

const coneccion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})
// Conectar a la base de datos
coneccion.connect((err) => {
    if(err){
        console.log('Error a conectar con la base de datos:', err);
    }
    else {
        console.log('Conexión exitosa a la base de datos');
    }
})
module.exports = coneccion;