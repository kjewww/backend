const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', ratingController.createRating);
router.get('/:tmdbId', ratingController.getRatings);
router.patch('/:tmdbId', ratingController.updateRating);
router.delete('/:tmdbId', ratingController.deleteRating);

module.exports = router;