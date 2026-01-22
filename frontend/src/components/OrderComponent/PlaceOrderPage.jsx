import Layout from "../Layout";
import DeliveryDetailsForm from "./DeliveryDetailsForm";
import OrderSummary from "./OrderSummary";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function PlaceOrderPage() {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // In your axios instance setup
  const api = axios.create({
    baseURL: import.meta.env.VITE_ORDER_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch actual cart items
  useEffect(() => {
    if (location.state?.checkedItems) {
      // Use the checked items passed from CartPage
      setCartItems(location.state.checkedItems);
      setLoading(false);
    } else {
      // Fallback to fetching all cart items (for direct navigation to this page)
      const fetchCart = async () => {
        try {
          const { data } = await api.get("/api/cart");
          const items = Array.isArray(data) ? data : data.items || [];
          setCartItems(items);
        } catch (error) {
          console.error("Error fetching cart:", error);
        } finally {
          setLoading(false);
        }
      };
x    }
  }, [location.state]);

  const calculateTotals = () => {
    const subtotal =
      cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
      0;
    const shipping = subtotal > 1000 ? 0 : 200;
    const tax = subtotal * 0.15;
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handlePlaceOrder = async () => {
    // Prevent double submission
    if (handlePlaceOrder.isSubmitting) return;
    handlePlaceOrder.isSubmitting = true;

    try {
      /* =========================
         VALIDATIONSx
      ========================= */
      if (!deliveryDetails) {
        await Swal.fire({
          icon: "warning",
          title: "Delivery details missing",
          text: "Please save delivery details before placing the order.",
        });
        return;
      }

      if (!paymentMethod) {
        await Swal.fire({
          icon: "warning",
          title: "Payment method missing",
          text: "Please select a payment method.",
        });
        return;
      }

      if (!cartItems?.length) {
        await Swal.fire({
          icon: "warning",
          title: "Empty Cart",
          text: "Your cart is empty. Please add items before proceeding.",
        });
        return;
      }

      /* =========================
         CALCULATIONS
      ========================= */
      const totals = calculateTotals();

      const orderPayload = {
        restaurantId: cartItems[0].restaurantId,
        items: cartItems.map((item) => ({
          itemId: item.menuItemId || item._id,
          name: item.menuItemName,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || "",
        })),
        totalAmount: Number(totals.total),
        deliveryAddress: deliveryDetails.deliveryAddress,
        paymentMethod:
          paymentMethod === "cash" ? "Cash on Delivery" : "Online Payment",
      };

      /* =========================
         CREATE ORDER
      ========================= */
      const { data: order } = await api.post("/api/orders", orderPayload);

      if (!order?._id) {
        throw new Error("Order creation failed");
      }

      /* =========================
         CLEAR CART (NON-BLOCKING)
      ========================= */
      const itemIds = cartItems.map((item) => item._id);
      api.delete("/api/cart/removeChecked", { data: { itemIds } }).catch(() => {
        console.warn("Cart cleanup failed — order is safe");
      });

      localStorage.setItem("currentOrder", order._id);

      /* =========================
         POST-ORDER FLOW
      ========================= */
      if (paymentMethod === "card") {
        navigate("/paymentPortal", { state: { orderId: order._id } });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Order Placed Successfully!",
        text: "Your order has been confirmed and will be delivered soon.",
        timer: 2500,
        showConfirmButton: false,
      });

      navigate("/myorders");
    } catch (error) {
      console.error("Order placement failed:", error);

      await Swal.fire({
        icon: "error",
        title: "Order Failed",
        text:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      handlePlaceOrder.isSubmitting = false;
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Complete Your Order
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <DeliveryDetailsForm
            onDetailsSubmit={setDeliveryDetails}
            paymentMethod={paymentMethod}
            onPaymentMethodSelect={setPaymentMethod}
          />

          <OrderSummary
            items={cartItems}
            paymentMethod={paymentMethod}
            deliveryDetails={deliveryDetails}
            onPlaceOrder={handlePlaceOrder}
            totals={calculateTotals()}
          />
        </div>
      </div>
    </Layout>
  );
}
