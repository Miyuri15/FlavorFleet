import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { makePayment } from "./Paynow";

export default function PaymentPortal() {
  const { state } = useLocation();
  const { orderId } = state || {};

  useEffect(() => {
    if (orderId) {
      makePayment(orderId);
    }
  }, [orderId]);

  return <p>Redirecting to payment...</p>;
}
