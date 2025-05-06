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
      fetchCart();
    }
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
    try {
      if (!cartItems || cartItems.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Empty Cart",
          text: "Your cart is empty. Please add items before proceeding.",
        });
        return;
      }

      const totals = calculateTotals();
      const orderData = {
        restaurantId: cartItems[0].restaurantId,
        items: cartItems.map((item) => ({
          itemId: item.menuItemId || item._id,
          name: item.menuItemName,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || "",
        })),
        totalAmount: parseFloat(totals.total),
        deliveryAddress: deliveryDetails?.address,
        paymentMethod:
          paymentMethod === "cash" ? "Cash on Delivery" : "Online Payment",
      };

      const response = await api.post("/api/orders", orderData);
      if (!response.data?._id) {
        throw new Error("Invalid order data received from server");
      }

      // **Check what itemIds are being sent**
      const itemIds = cartItems.map((item) => item._id);
      console.log("✅ Sending these item IDs to remove:", itemIds);

      // **Check if API request works**
      try {
        const removeResponse = await api.delete("/api/cart/removeChecked", {
          data: { itemIds },
        });
        console.log("🛒 Response from cart removal:", removeResponse.data);
      } catch (clearError) {
        console.error("❌ Error clearing checked items from cart:", clearError);
      }

      localStorage.setItem("currentOrder", response.data._id);

      if (paymentMethod === "card") {
        navigate("/paymentPortal", { state: { orderId: response.data._id } });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Order Placed Successfully!",
          text: "Your order has been confirmed and will be delivered soon.",
          confirmButtonText: "View My Orders",
          timer: 3000,
          timerProgressBar: true,
          willClose: () => {
            navigate("/myorders");
          },
        });
        navigate("/myorders");
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: "Failed to place order. Please try again.",
      });
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
