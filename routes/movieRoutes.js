const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/trending', movieController.getTrending); // Contoh: /api/movies/trending?timeWindow=week
router.get('/search', movieController.searchMovies); // Contoh: /api/movies/search?query=interstellar
router.get('/discover', movieController.discoverMovies); // Contoh: /api/movies/discover?genreIds=28,12&sortBy=vote_average.desc
router.get('/genres', movieController.getGenres); // 
router.get('/detail/:id', movieController.getMovieDetail); // Contoh: /api/movies/detail/550

module.exports = router;