const express = require('express');
const FavoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Add to favorites
router.post('/menu/:id/favorite', FavoriteController.addFavorite);

// Remove from favorites
router.delete('/menu/:id/unfavorite', FavoriteController.removeFavorite);

// Check if item is favorited by user
router.get('/menu/:id/is-favorite', FavoriteController.checkFavoriteStatus);

// Get all favorites for a user
router.get('/user/favorites', FavoriteController.getUserFavorites);

module.exports = router;