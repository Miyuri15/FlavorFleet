const stripe = require("stripe")(process.env.STRIPE_SECRET);

const paymentController = {
    async createCheckoutSession (req, res) {
        try{
        const {products} = req.body;
        
        console.log("Received products:", products);
        const lineItems = products.map((product) => ({
            price_data: {
                currency: "lkr",
                product_data: {
                    name: product.menuItemName,
                    images: product.image ? [product.image] : []
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
            success_url: 'http://localhost:3000/paymentsuccess',
            cancel_url: 'http://localhost:3000/paymentcancled',
        });

        res.json({ id: session.id });
    }
        catch (error) {
            console.error("Error creating checkout session:", error);
            res.status(500).json({ error: "error" });
        }
    }
}

module.exports = paymentController;