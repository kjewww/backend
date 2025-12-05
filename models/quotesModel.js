const db = require('../config/db');

// Membuat quote baru
const createQuote = async (userId, tmdbId, quoteText, quoter) => {
const query = `
    INSERT INTO quotes (user_id, tmdb_id, quote_text, quoter, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
`;
const values = [userId, tmdbId, quoteText, quoter];
const result = await db.query(query, values);
return result.rows[0];
};

// Mendapatkan semua quotes milik user
const getAllQuotesByUserId = async (userId) => {
const query = `
    SELECT 
    q.*,
    m.title,
    m.release_year,
    m.poster_path,
    m.media_type
    FROM quotes q
    LEFT JOIN movies m ON q.tmdb_id = m.tmdb_id
    WHERE q.user_id = $1
    ORDER BY q.created_at DESC
`;
const result = await db.query(query, [userId]);
return result.rows;
};

// Mendapatkan quote berdasarkan ID
const getQuoteById = async (quoteId) => {
const query = `
    SELECT 
    q.*,
    m.title,
    m.release_year,
    m.poster_path,
    m.media_type,
    m.genre
    FROM quotes q
    LEFT JOIN movies m ON q.tmdb_id = m.tmdb_id
    WHERE q.id = $1
`;
const result = await db.query(query, [quoteId]);
return result.rows[0];
};

// Update quote
const updateQuote = async (quoteId, quoteText, quoter) => {
const query = `
    UPDATE quotes
    SET quote_text = $1, quoter = $2
    WHERE id = $3
    RETURNING *
`;
const values = [quoteText, quoter, quoteId];
const result = await db.query(query, values);
return result.rows[0];
};

// Hapus quote
const deleteQuote = async (quoteId) => {
const query = 'DELETE FROM quotes WHERE id = $1 RETURNING *';
const result = await db.query(query, [quoteId]);
return result.rows[0];
};

// Cek apakah user adalah pemilik quote
const isQuoteOwner = async (quoteId, userId) => {
const query = 'SELECT user_id FROM quotes WHERE id = $1';
const result = await db.query(query, [quoteId]);

if (result.rows.length === 0) {
    return false;
}

return result.rows[0].user_id === userId;
};

// Mendapatkan quotes berdasarkan tmdb_id (opsional - untuk melihat semua quote dari satu film)
const getQuotesByTmdbId = async (userId, tmdbId) => {
const query = `
    SELECT 
    q.*,
    m.title,
    m.release_year,
    m.poster_path,
    m.media_type
    FROM quotes q
    LEFT JOIN movies m ON q.tmdb_id = m.tmdb_id
    WHERE q.user_id = $1 AND q.tmdb_id = $2
    ORDER BY q.created_at DESC
`;
const result = await db.query(query, [userId, tmdbId]);
return result.rows;
};

module.exports = {
createQuote,
getAllQuotesByUserId,
getQuoteById,
updateQuote,
deleteQuote,
isQuoteOwner,
getQuotesByTmdbId
};