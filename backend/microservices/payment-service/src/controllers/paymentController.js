const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Order = require("../../../order-service/src/models/orderModel"); // Make sure the path is correct

const paymentController = {
  async createCheckoutSession(req, res) {
    try {
      const { products, orderId } = req.body;
      const userId = req.user.id;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

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
        success_url: "http://localhost:3000/paymenthistory",
        cancel_url: "http://localhost:3000/paymentcancled",
        metadata: {
          orderId: orderId, // ✅ Pass Order ID to metadata
          userId: userId, 
        },
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Unable to create Stripe session" });
    }
  },

  // ✅ Stripe webhook to update payment status
  async handleWebhook(req, res) {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("Webhook event received:", event);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event type
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
  
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;
  
      if (!orderId || !userId) {
        console.error("Missing orderId or userId in session metadata");
        return res.status(400).send("Missing order ID or user ID");
      }
  
      try {
        // Update the order payment status as "Completed"
        const order = await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "Completed",
          paymentMethod: "Online Payment", // Optionally update payment method here
        }, { new: true });
  
        console.log(`✅ Order ${orderId} payment marked as Completed`);
  
        // Optionally, you can update user's payment history or send a notification
        // For example, you could fetch user details and send them a payment confirmation
  
        // Optionally, you could trigger a notification for the user (e.g., via email or message)
        // Example: await UserService.sendPaymentConfirmation(userId, orderId);
  
      } catch (err) {
        console.error("Failed to update order:", err.message);
        return res.status(500).send("Failed to update order status");
      }
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  },
  

  async getSessionDetails(req, res) {
    try {
      const session = await stripe.checkout.sessions.retrieve(req.params.id);

      // Optionally match with your local Order model using metadata (if stored)
      // const order = await Order.findOne({ stripeSessionId: req.params.id });

      res.json({
        orderId: session.metadata?.orderId || "Unknown",
        amount: session.amount_total,
        paymentStatus: session.payment_status,
        paidAt: session.created * 1000, // convert UNIX timestamp to ms
      });
    } catch (err) {
      console.error("Error fetching session:", err);
      res.status(500).json({ message: "Failed to retrieve session" });
    }
  },

  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id; // Extract the user ID from the request (assuming user is authenticated)
      
      const orders = await Order.find({ userId }).sort({ updatedAt: -1 }); // Get all orders for the user, sorted by most recent
      res.json(orders);
      console.log("Payment history fetched successfully:", orders);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      res.status(500).json({ message: "Failed to fetch payment history." });
    }
  }
};

module.exports = paymentController;