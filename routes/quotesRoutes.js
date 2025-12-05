const express = require('express');
const router = express.Router();
const quotesController = require('../controllers/quotesController');
const { protect } = require('../middleware/authMiddleware');

// Semua routes memerlukan autentikasi
router.use(protect);

// Routes untuk quotes management
router.post('/', quotesController.addQuote);                        // Membuat quote baru
router.get('/', quotesController.getAllQuotes);                     // Mendapatkan semua quotes user
router.get('/:quoteId', quotesController.getQuote);                 // Mendapatkan detail quote
router.put('/:quoteId', quotesController.updateQuote);              // Update quote
router.delete('/:quoteId', quotesController.deleteQuote);           // Hapus quote

// Route opsional - mendapatkan semua quotes dari satu film
router.get('/movie/:tmdbId', quotesController.getQuotesByMovie);    // Mendapatkan quotes berdasarkan movie

module.exports = router;