const FavoriteService = require("../services/favoriteService");

const FavoriteController = {
   async addFavorite(req, res) {
    try {
      const favorite = await FavoriteService.addFavorite(
        req.user.id,
        req.params.id
      );
      res.json({
        success: true,
        isFavorite: true,
        favorite
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add favorite'
      });
    }
  },

  async removeFavorite(req, res) {
    try {
      const result = await FavoriteService.removeFavorite(
        req.user.id, 
        req.params.id
      );
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
      }
      
      res.json({
        success: true,
        isFavorite: false
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to remove favorite'
      });
    }
  },

   async checkFavoriteStatus(req, res) {
    try {
      const isFavorite = await FavoriteService.isFavorite(
        req.user.id,
        req.params.id
      );
      res.json({
        success: true,
        isFavorite
      });
    } catch (error) {
      console.error('Error checking favorite status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check favorite status'
      });
    }
  },

   async getUserFavorites(req, res) {
    try {
      const favorites = await FavoriteService.getUserFavorites(req.user.id);
      res.json({
        success: true,
        favorites
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get favorites'
      });
    }
  }
}

module.exports = FavoriteController;