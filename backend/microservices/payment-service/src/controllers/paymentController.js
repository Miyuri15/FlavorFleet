const stripe = require("stripe")(process.env.STRIPE_SECRET);

const paymentController = {
  async createCheckoutSession(req, res) {
    try {
      const { products } = req.body;

      console.log("Received products:", products);
      const lineItems = products.map((product) => ({
        price_data: {
          currency: "lkr",
          product_data: {
            name: product.menuItemName,
            images: product.image
              ? [product.image]
              : [
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                ],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: product.quantity,
      }));

      console.log("Line Items for Stripe:", lineItems);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:3000/paymentsuccess",
        cancel_url: "http://localhost:3000/paymentcancled",
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "error" });
    }
  },
};

module.exports = paymentController;
