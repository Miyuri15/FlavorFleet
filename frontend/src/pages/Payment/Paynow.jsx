import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

export const makePayment = async () => {
  try {
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const { data } = await api.get("http://localhost:5005/api/cart");
    const items = Array.isArray(data) ? data : data.items || [];

    const orderId = localStorage.getItem("currentOrder");

    if (!orderId) {
      console.error("Order ID not found in localStorage");
      return;
    }

    const stripe = await loadStripe(
      "pk_test_51RFqDTQ4uyAwVSIn5OcGRds8O50CkseXeIRMznOTgFBEv7TYPjX9XC1J6vbGMsEKyxBrJiaBGD0UWWJkdwcfSOdR00mFBmWDVY"
    );

    const response = await api.post(
      "http://localhost:5002/api/payment/create-checkout-session",
      {
        products: items,
        orderId: orderId, // Pass orderId to backend
      }
    );

    const session = response.data;

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error("Stripe redirection error:", result.error.message);
    }
  } catch (error) {
    console.error("Error during payment:", error);
  }
};

export default makePayment;
