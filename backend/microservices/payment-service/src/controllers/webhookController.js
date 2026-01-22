const stripe = require("stripe")(process.env.STRIPE_SECRET);
const axios = require("axios");

const ORDER_SERVICE_URL = "http://localhost:5005";

async function handleStripeWebhook(req, res) {
    console.log("🔥 WEBHOOK HIT");

    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // ✅ Payment completed
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const orderId = session.metadata?.orderId;

            if (orderId) {
                // Call Order Service to mark paid
                await axios.patch(
                    `${ORDER_SERVICE_URL}/api/orders/${orderId}/payment`,
                    { paymentStatus: "Completed" },
                    {
                        headers: {
                            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
                        },
                    }
                );
            }
        }

        return res.json({ received: true });
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
}

module.exports = { handleStripeWebhook };
