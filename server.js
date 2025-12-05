const app = require('./app');
const db = require('./config/db');
const PORT = process.env.PORT || 5000;
const dotenv = require('dotenv');
dotenv.config();

app.get('/status/db', (req, res) => {
    // Objek pool dari library pg memiliki properti status
    const poolStatus = {
        totalCount: db.pool.totalCount,       // Total client (koneksi) di pool
        idleCount: db.pool.idleCount,         // Jumlah koneksi yang tidak digunakan (siap pakai)
        waitingCount: db.pool.waitingCount,   // Jumlah query yang sedang menunggu giliran koneksi
        max: db.pool.options.max,             // Batas maksimum koneksi (default 10)
    };

    res.json(poolStatus);
});

app.get('/test-db', async (req, res) => {
    try {
        // Memaksa backend untuk mengirim query ke PostgreSQL
        const result = await db.query('SELECT NOW()'); 
        
        // Jika berhasil, kirim timestamp dari database
        res.json({
            message: 'Koneksi dari backend ke database berhasil!',
            database_timestamp: result.rows[0].now 
        });
    } catch (err) {
        console.error('Error saat menjalankan query:', err);
        res.status(500).json({ error: 'GAGAL MENJALANKAN QUERY KE DATABASE.' });
    }
});

app.get('/', (req, res) => {
    res.send('Server berjalan. Coba /test-db');
});

app.listen(PORT, () => {
    console.log(`server berjalan di http://localhost:${PORT}`);
})

