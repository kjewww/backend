const db = require('../config/db');
const movieModel = require('./movieModel');

const createRating = async (ratingData) => {
    const { tmdbId, userId, score, reviewText, title, release_year, poster_path } = ratingData; 

    if (!tmdbId || !userId || score == null) {
        throw new Error("Data rating tidak lengkap.");
    }

    try {
        await movieModel.ensureMovieExists({
            tmdb_id: tmdbId,
            title: title,
            release_year: release_year,
            poster_path: poster_path,
        });

        const checkQuery = 'SELECT * FROM ratings WHERE tmdb_id = $1 AND user_id = $2';
        const checkResult = await db.query(checkQuery, [tmdbId, userId]);
        
        if (checkResult.rows.length > 0) {
            throw new Error("Rating sudah ada. Gunakan PATCH untuk memperbarui.");
        }

        const insertQuery = `
            INSERT INTO ratings (tmdb_id, user_id, score, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        
        const values = [tmdbId, userId, score, reviewText || null]; 
        const result = await db.query(insertQuery, values);
        
        return result.rows[0];

    } catch (error) {
        console.error("Error creating rating:", error);
        throw error; // Lemparkan error ke Controller
    }
};

const updateRating = async (tmdbId, userId, score, reviewText) => {
    try {

        const updateQuery = `
            UPDATE ratings 
            SET score = $3, review_text = $4, rated_at = NOW()
            WHERE tmdb_id = $1 AND user_id = $2
            RETURNING *;
        `;
        
        const values = [tmdbId, userId, score, reviewText || null];
        const result = await db.query(updateQuery, values);
        
        if (result.rowCount === 0) {
            throw new Error("Rating tidak ditemukan. Gunakan POST untuk membuat rating baru.");
        }

        return result.rows[0];

    } catch (error) {
        console.error("Error updating rating:", error);
        throw error;
    }
};


const deleteRating = async (tmdbId, userId) => {
    try {
        const deleteQuery = `
            DELETE FROM ratings WHERE tmdb_id = $1 AND user_id = $2
            RETURNING *;
        `;
        
        const result = await db.query(deleteQuery, [tmdbId, userId]);

        if (result.rowCount === 0) {
            return { message: "Rating tidak ditemukan untuk pengguna ini." };
        }
        
        return { message: "Rating berhasil dihapus." };

    } catch (error) {
        console.error("Error deleting rating:", error);
        throw new Error("Gagal menghapus rating film.");
    }
};

const getMovieRatings = async (tmdbId, userId) => {
    try {
        const ratingsQuery = `
            SELECT 
                score AS personal_score,
                review_text AS personal_review
            FROM ratings
            WHERE tmdb_id = $1 AND user_id = $2;
        `;
        
        const result = await db.query(ratingsQuery, [tmdbId, userId]);
        
        if (result.rows.length === 0) {
            return { personalScore: null, personalReview: null };
        }
        
        const row = result.rows[0];

        return {
            personalScore: row.personal_score !== null ? parseFloat(row.personal_score) : null,
            personalReview: row.personal_review || null, 
        };

    } catch (error) {
        console.error("Error fetching personal movie rating:", error);
        throw new Error("Gagal mengambil data rating pribadi film.");
    }
};


module.exports = {
    createRating,
    updateRating,
    deleteRating,
    getMovieRatings,
};