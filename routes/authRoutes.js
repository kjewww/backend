const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.registerUser); // create
router.post('/login', authController.loginUser);
router.get('/users', authController.getAllUser); // get all users (no auth)
router.get('/profile', protect, (req, res) => { // read
    res.json({
        message: `akses berhasil untuk user iD: ${req.userId}`,
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.display_name
    });
});
router.put('/update-display', protect, authController.updateUserDisplay); // update
router.delete('/delete-account', protect, authController.deleteAccount); // delete

module.exports = router;