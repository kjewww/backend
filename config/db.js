const { Pool, Client } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(client => {
        console.log('koneksi ke PostgreSQL sukses');
        client.release();
    })
    .catch(err => {
        console.error('gagal koneksi ke PostgreSQL:', err.message);
        process.exit(1);
    });

pool.on('error', (err, client) => {
    console.error('kesalahan tak terduga pada client idle di pool:', err.message);
});

// pool.query('SELECT NOW()', (err, res) => {
//     if (err) {
//         console.error('GAGAL KONEKSI KE DATABASE:', err);
//     } else {
//         console.log('Koneksi database berhasil.');
//     }
// });

module.exports = { 
    pool,
    query: (text, params) => pool.query(text, params),
};

