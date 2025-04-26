const Favourite = require("../models/Favourite");

const FavoriteService = {
  async addFavorite(userId, menuItemId) {
    const favorite = await Favourite.findOneAndUpdate(
      { user: userId, menuItem: menuItemId },
      {},
      { upsert: true, new: true }
    ).populate('menuItem');
    return favorite;
  },

  async removeFavorite(userId, menuItemId) {
    const result = await Favourite.findOneAndDelete({
      user: userId,
      menuItem: menuItemId
    });
    return result;
  },

  async isFavorite(userId, menuItemId) {
    const favorite = await Favourite.findOne({
      user: userId,
      menuItem: menuItemId
    });
    return !!favorite;
  },

  async getUserFavorites(userId) {
    return Favourite.find({ user: userId }).populate('menuItem');
  }
};

module.exports = FavoriteService;