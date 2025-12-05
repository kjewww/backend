const movieModel = require('../models/movieModel');

// get trending
const getTrending = async (req, res) => {
    // timeWindow bisa 'day' atau 'week', default 'day'
    const { timeWindow } = req.query; 
    
    try {
        const movies = await movieModel.getTrendingMovies(timeWindow);
        res.json({results: movies});
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        res.status(500).json({ message: error.message });
    }
};

// search movie
const searchMovies = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Parameter 'query' wajib diisi untuk pencarian." });
    }

    try {
        const results = await movieModel.searchMovies(query);
        res.json(results);
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ message: error.message });
    }
};

const discoverMovies = async (req, res) => {
    const { genreIds, sortBy, page } = req.query;
    
    // Parsing genreIds dari string ke array
    const genreArray = genreIds ? genreIds.split(',').map(id => parseInt(id.trim())) : [];

    try {
        const movies = await movieModel.filterMovies({
            genreIds: genreArray,
            sortBy: sortBy,
            page: parseInt(page) || 1
        });
        res.json(movies);
    } catch (error) {
        console.error('Error discovering movies:', error);
        res.status(500).json({ message: error.message });
    }
};

const getGenres = async (req, res) => {
    try {
        const genres = await movieModel.getGenreList();
        res.json(genres);
    } catch (error) {
        console.error('Error fetching genre list:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get detail movie by TMDB id
const getMovieDetail = async (req, res) => {
    const movieId = req.params.id;
    try {
        const detail = await movieModel.getDetailMovie(movieId);
        res.json(detail);
    } catch (error) {
        console.error('Error fetching movie detail:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTrending,
    searchMovies,
    discoverMovies,
    getGenres
    ,getMovieDetail
};