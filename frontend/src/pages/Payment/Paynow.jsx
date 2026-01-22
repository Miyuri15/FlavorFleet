import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51RFqDTQ4uyAwVSIn5OcGRds8O50CkseXeIRMznOTgFBEv7TYPjX9XC1J6vbGMsEKyxBrJiaBGD0UWWJkdwcfSOdR00mFBmWDVY";

const PAYMENT_BACKEND_URL = "http://localhost:5002";

export const makePayment = async (orderId) => {
  if (!orderId) {
    console.error("❌ makePayment called without orderId");
    return;
  }

  try {
    /* =========================
       LOAD STRIPE
    ========================= */
    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }

    /* =========================
       CREATE CHECKOUT SESSION
       (ORDER-BASED, NOT CART)
    ========================= */
    const response = await axios.post(
      `${PAYMENT_BACKEND_URL}/api/payment/create-checkout-session`,
      { orderId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const sessionId = response?.data?.id;

    if (!sessionId) {
      throw new Error("Invalid Stripe session ID");
    }

    /* =========================
       REDIRECT TO STRIPE
    ========================= */
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error("❌ Stripe redirect error:", error.message);
    }
  } catch (error) {
    console.error("❌ Payment initialization failed:", error);

    alert(
      error?.response?.data?.message ||
        "Failed to initiate payment. Please try again."
    );
  }
};

export default makePayment;
