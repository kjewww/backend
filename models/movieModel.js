const db = require('../config/db');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const TMDB_URL = process.env.TMDB_BASE_URL;
const TMDB_OPTIONS = {
    headers: {
        Authorization: process.env.TMDB_READ_ACCESS_TOKEN, // Bearer Token
    },
};

const getDetailMovie = async (movieId) => {
    try {
        const url = `${TMDB_URL}/movie/${movieId}`;
        const response = await axios.get(url, TMDB_OPTIONS);
        const data = response.data;

        const mappedDetail = {
            tmdb_id: data.id,
            title: data.title,
            overview: data.overview,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            release_year: data.release_date ? data.release_date.split('-')[0] : null,
            genres: data.genres,
            vote_average: data.vote_average,
            runtime: data.runtime
        };

        // Prepare minimal movie object for internal DB caching and ensure it's stored
        const movieForDb = {
            tmdb_id: data.id,
            title: data.title,
            release_year: data.release_date ? parseInt(data.release_date.split('-')[0]) : null,
            poster_path: data.poster_path,
            media_type: 'movie',
            genre_ids: data.genres ? data.genres.map(g => g.id) : [],
            plot: data.overview
        };

        try {
            const internalId = await ensureMovieExists(movieForDb);
            // tambahkan internal id ke response supaya client tahu id internal jika perlu
            return Object.assign({ internal_id: internalId }, mappedDetail);
        } catch (dbErr) {
            // Jika penyimpanan gagal, tetap kembalikan detail TMDB tapi log error
            console.error('Error ensuring movie exists in DB:', dbErr.message || dbErr);
            return mappedDetail;
        }

    } catch (error) {
        console.error("Error fetching movie detail:", error.message);
        throw new Error("Gagal mengambil detail film.");
    }
}

const mapTmdbMovie = (tmdbMovie) => {
    const tmdbId = tmdbMovie.id;
    const releaseYear = tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.substring(0, 4)) : null;
    return {
        tmdb_id: tmdbId,
        title: tmdbMovie.title,
        release_year: releaseYear,
        poster_path: tmdbMovie.poster_path,
        media_type: tmdbMovie.media_type || 'movie',
        plot: tmdbMovie.overview,
        genre_ids: tmdbMovie.genre_ids, 
        vote_average: tmdbMovie.vote_average,
        vote_count: tmdbMovie.vote_count
    };
}

// Mendapatkan daftar film Trending (Discovery)
const getTrendingMovies = async (timeWindow = 'day') => {
    try {
        const url = `${TMDB_URL}/trending/movie/${timeWindow}`;
        const response = await axios.get(url, TMDB_OPTIONS);
        
        // Mapping setiap hasil sebelum dikirim
        return response.data.results.map(mapTmdbMovie); 
    } catch (error) {
        console.error("Error fetching trending movies:", error.message);
        throw new Error("Gagal mengambil daftar film trending.");
    }
};

// Pencarian Film berdasarkan Nama (Search)
const searchMovies = async (query) => {
    try {
        const url = `${TMDB_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`;
        const response = await axios.get(url, TMDB_OPTIONS);

        // Mapping setiap hasil sebelum dikirim
        return response.data.results.map(mapTmdbMovie);
    } catch (error) {
        console.error("Error searching movies:", error.message);
        throw new Error("Gagal melakukan pencarian film.");
    }
};

// Filter Film berdasarkan Genre dan Kriteria lainnya (Discover)
const filterMovies = async ({ genreIds = [], sortBy = 'popularity.desc', page = 1 }) => {
    try {
        // Gabungkan ID genre menjadi string (misalnya '28,12')
        const genreString = genreIds.join(','); 
        
        let url = `${TMDB_URL}/discover/movie?language=en-US&page=10`;
        url += `&sort_by=${sortBy}`;
        url += `&page=${page}`;
        
        if (genreIds.length > 0) {
            url += `&with_genres=${genreString}`;
        }

        const response = await axios.get(url, TMDB_OPTIONS);
        
        // Mapping setiap hasil sebelum dikirim
        return response.data.results.map(mapTmdbMovie);

    } catch (error) {
        console.error("Error filtering movies:", error.message);
        throw new Error("Gagal melakukan filter film.");
    }
};

// Caching: Memastikan film ada di tabel 'movies' internal
const ensureMovieExists = async (movieData) => {
    // Cek apakah film sudah ada berdasarkan tmdb_id
    const checkQuery = 'SELECT id FROM movies WHERE tmdb_id = $1';
    const checkResult = await db.query(checkQuery, [movieData.tmdb_id]);

    if (checkResult.rows.length > 0) {
        return checkResult.rows[0].id;
    }

    // Jika tidak ada, masukkan data dasar film
    const insertQuery = `
        INSERT INTO movies (tmdb_id, title, release_year, poster_path, media_type, genre, plot)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `;
    
    const genreString = movieData.genre_ids ? movieData.genre_ids.join(',') : null;
    
    const values = [
        movieData.tmdb_id, 
        movieData.title,
        movieData.release_year, 
        movieData.poster_path,
        movieData.media_type || 'movie',
        genreString, // Simpan ID Genre sementara
        movieData.plot // Simpan overview sebagai plot
    ];

    try {
        const insertResult = await db.query(insertQuery, values);
        return insertResult.rows[0].id;
    } catch (error) {
        console.error("Error inserting movie data:", error);
        throw new Error("Gagal menyimpan data film ke database internal.");
    }
};

// Mengambil daftar ID dan Nama Genre
const getGenreList = async () => {
    try {
        const url = `${TMDB_URL}/genre/movie/list?language=en-US`;
        const response = await axios.get(url, TMDB_OPTIONS);
        return response.data.genres;
    } catch (error) {
        console.error("Error fetching genre list:", error.message);
        throw new Error("Gagal mengambil daftar genre.");
    }
};

const getUserById = async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0]; //
};

module.exports = {
    getTrendingMovies,
    searchMovies,
    filterMovies,
    ensureMovieExists,
    getGenreList,
    getDetailMovie,
    getUserById,
};

