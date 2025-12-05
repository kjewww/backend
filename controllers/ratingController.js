const ratingModel = require('../models/ratingModel');

const createRating = async (req, res) => {
    const { tmdbId, userId, score, reviewText, title, release_year, poster_path } = req.body; 

    if (!tmdbId || !userId || score == null || !title) {
        return res.status(400).json({ 
            message: "Data yang dibutuhkan (tmdbId, userId, score, title) tidak lengkap." 
        });
    }

    const validScore = Math.min(10, Math.max(1, parseInt(score)));
    
    const ratingData = {
        tmdbId: parseInt(tmdbId),
        userId: userId, 
        score: validScore,
        reviewText: reviewText,
        title: title, 
        release_year: release_year, 
        poster_path: poster_path 
    };

    try {
        const rating = await ratingModel.createRating(ratingData); 
        res.status(201).json({ 
            message: "Rating berhasil dibuat.",
            rating: rating 
        });
    } catch (error) {
        console.error('Error in createRating:', error.message);
        if (error.message.includes("Rating sudah ada")) {
            return res.status(409).json({ 
                message: error.message, 
                suggestionMessage: "Gunakan endpoint PATCH untuk memperbarui rating yang sudah ada." 
            }); 
        }
        res.status(500).json({ message: "Gagal membuat rating film." });
    }
};

const getAllRating = async (res) => {
    
}

const updateRating = async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId); 
    const { userId, score, reviewText } = req.body; 

    if (!userId) {
        return res.status(400).json({
            message: "userid tidak ada"
        });
    }

    if (score === null) {
        return res.status(400).json({
            message: "score tidak boleh null"
        });
    }

    if (isNaN(tmdbId) || tmdbId <= 0) {
        return res.status(400).json({
            message: "tmdbid tidak ada"
        });
    }

    const validScore = Math.min(10, Math.max(1, parseInt(score)));

    try {
        const rating = await ratingModel.updateRating(tmdbId, userId, validScore, reviewText); 
        res.status(200).json({ 
            message: "Rating berhasil diperbarui.",
            rating: rating 
        });
    } catch (error) {
        console.error('Error in updateRating:', error.message);
        if (error.message.includes("Rating tidak ditemukan")) {
            // 404 Not Found: Item yang ingin diupdate tidak ada
            return res.status(404).json({ 
                message: error.message, 
                suggestionMessage: "Gunakan endpoint POST untuk membuat rating baru." }); 
        }
        res.status(500).json({ message: "Gagal memperbarui rating film." });
    }
};


const getRatings = async (req, res) => { 
    const { userId } = req.query;
    const tmdbId = parseInt(req.params.tmdbId);
    
    if (!tmdbId || !userId) {
        return res.status(400).json({ 
            message: "tmdbId (di URL) dan userId (di query) wajib diisi." });
    }

    try {
        const personalRating = await ratingModel.getMovieRatings(tmdbId, userId);
        res.json(personalRating);
    } catch (error) {
        console.error('Error in getRatings:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteRating = async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId); 
    const { userId } = req.body; 

    if (!tmdbId || !userId) {
        return res.status(400).json({ message: "tmdbId (di URL) dan userId wajib diisi." });
    }

    try {
        const result = await ratingModel.deleteRating(tmdbId, userId);
        res.json({ 
            message: result.message 
        });
    } catch (error) {
        console.error('Error in deleteRating:', error);
        res.status(500).json({ 
            message: error.message 
        });
    }
};

module.exports = {
    createRating,
    updateRating,
    getRatings,
    deleteRating,
};