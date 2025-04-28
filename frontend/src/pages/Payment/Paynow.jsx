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

    const stripe = await loadStripe("pk_test_51RFqDTQ4uyAwVSIn5OcGRds8O50CkseXeIRMznOTgFBEv7TYPjX9XC1J6vbGMsEKyxBrJiaBGD0UWWJkdwcfSOdR00mFBmWDVY");

    console.log("Items to be paid:", items);
    // Use api.post() instead of fetch
    const response = await api.post(
      "http://localhost:5002/api/payment/create-checkout-session",
      { products: items }
    );

    const session = response.data; // Axios stores response data in .data

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  } catch (error) {
    console.error("Error during payment:", error);
  }
};

export default makePayment;