const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const authMiddleware = require('../middleware/authMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', listController.addList);                           
router.get('/', listController.getAllList);                         
router.get('/:listId', listController.getListDetail);               
router.put('/:listId', listController.updateList);                  
router.delete('/:listId', listController.deleteList);

router.post('/:listId/movies', listController.addMovieToList);      // Tambah movie ke list
router.delete('/:listId/movies/:tmdbId', listController.removeMovieFromList); // Hapus movie dari list

module.exports = router;
