const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const ORDER_SERVICE_URL = "http://localhost:5005";

const paymentController = {
  async createCheckoutSession(req, res) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID required" });
      }

      /* =========================
         FETCH ORDER FROM ORDER SERVICE
      ========================= */
      const { data: order } = await axios.get(
        `${ORDER_SERVICE_URL}/api/orders/${orderId}/checkout`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      console.log("✅ Order received for Stripe:", order);

      /* =========================
         STRIPE LINE ITEMS
      ========================= */
      const lineItems = order.items.map((item) => ({
        price_data: {
          currency: "lkr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        success_url: `http://localhost:3000/paymentsuccess?orderId=${orderId}`,
        cancel_url: `http://localhost:3000/paymentcanceled?orderId=${orderId}`,
        metadata: {
          orderId,
        },
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error("Stripe checkout error:", error?.response?.data || error);
      res.status(500).json({ message: "Payment failed" });
    }
  },
};

module.exports = paymentController;
