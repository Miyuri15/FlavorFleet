const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Webhook route should NOT be protected by auth
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// ✅ Apply auth middleware AFTER webhook route
router.use(authMiddleware);

router.post("/create-checkout-session", paymentController.createCheckoutSession);
router.get("/session/:id", paymentController.getSessionDetails);
router.get("/payment-history", paymentController.getPaymentHistory);

module.exports = router;
