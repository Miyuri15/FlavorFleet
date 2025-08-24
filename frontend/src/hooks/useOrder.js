import { useState, useEffect } from "react";
import { orderService, handleApiError } from "../services/api";

export const useCart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await orderService.getCart();
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch cart"));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      const response = await orderService.addToCart(item);
      setCart(response.data);
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to add item to cart");
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await orderService.removeFromCart(itemId);
      setCart(response.data);
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(
        err,
        "Failed to remove item from cart"
      );
      return { success: false, error: errorMessage };
    }
  };

  const updateCartItem = async (itemId, updateData) => {
    try {
      const response = await orderService.updateCartItem(itemId, updateData);
      setCart(response.data);
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to update cart item");
      return { success: false, error: errorMessage };
    }
  };

  const clearCart = async () => {
    try {
      await orderService.clearCart();
      setCart({ items: [], total: 0 });
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to clear cart");
      return { success: false, error: errorMessage };
    }
  };

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    refetch: fetchCart,
  };
};

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch orders"));
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await orderService.createOrder(orderData);
      setOrders((prev) => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to create order");
      return { success: false, error: errorMessage };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to update order status");
      return { success: false, error: errorMessage };
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders,
  };
};
