const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../../../../gateway/src/middleware/authMiddleware');

// Apply auth middleware to all cart routes
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);
router.post('/place-order', cartController.placeOrder);
router.get('/count', cartController.getCartItemCount);

module.exports = router;