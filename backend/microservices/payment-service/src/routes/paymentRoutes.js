const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/create-checkout-session", paymentController.createCheckoutSession);

module.exports = router;