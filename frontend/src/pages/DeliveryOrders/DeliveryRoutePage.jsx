import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import DeliveryRoute from "./DeliveryRoute";
import { Button, Spin, Typography, Card, Modal } from "antd";
import { toast } from "react-toastify";
import { cartServiceApi } from "../../../apiClients";
import ROUTES from "../../routes";

const { Title } = Typography;

const DeliveryRoutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderFromState = location.state?.order || null;
  const [order, setOrder] = useState(orderFromState);
  const [loading, setLoading] = useState(false);
  const [cashCollected, setCashCollected] = useState(false);

  useEffect(() => {
    if (!order) {
      // Fetch the current delivery order automatically
      fetchCurrentOrder();
    } else {
      // Initialize cash collected based on order
      setCashCollected(order.paymentStatus === "Completed");
    }
  }, [order]);

  const fetchCurrentOrder = async () => {
    try {
      setLoading(true);
      const res = await cartServiceApi.get("/orders/delivery/orders"); // ✅
      const orders = Array.isArray(res.data) ? res.data : res.data.data || [];

      // Find first assigned order that is not delivered
      const activeOrder = orders.find(
        (o) => o.status === "Out for Delivery" || o.status === "Prepared"
      );

      if (activeOrder) {
        setOrder(activeOrder);
        setCashCollected(activeOrder.paymentStatus === "Completed");
      } else {
        toast.info("No active delivery assigned!");
        navigate(ROUTES.DELIVERY_ORDERS);
      }
    } catch (error) {
      console.error("Failed to fetch current order", error);
      toast.error("Failed to load current delivery order");
      navigate(ROUTES.DELIVERY_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      setLoading(true);
      await cartServiceApi.patch(`/orders/${order._id}/status`, {
        status: "Delivered",
      });
      toast.success("Order marked as Delivered!");
      navigate(ROUTES.DELIVERY_ORDERS);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleCashCollected = async () => {
    try {
      setLoading(true);
      await cartServiceApi.patch(`/orders/${order._id}/payment-status`, {
        paymentStatus: "Completed",
      });
      toast.success("Cash marked as collected!");

      Modal.success({
        title: "Cash Received!",
        content: "You have successfully collected the payment from customer.",
      });

      setOrder({ ...order, paymentStatus: "Completed" });
      setCashCollected(true);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to mark payment collected"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <Layout>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Spin spinning={loading}>Loading delivery info...</Spin>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Delivery Navigation
          </Title>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <Button
              onClick={() => navigate(ROUTES.DELIVERY_ORDERS)}
              style={{ backgroundColor: "#f0f0f0", borderColor: "#d9d9d9" }}
            >
              Back to Orders
            </Button>
            <Button
              type="primary"
              onClick={handleMarkDelivered}
              loading={loading}
              disabled={
                order.paymentMethod === "Cash on Delivery" && !cashCollected
              }
              style={{
                backgroundColor: cashCollected ? "#52c41a" : "#d9d9d9",
                borderColor: cashCollected ? "#52c41a" : "#d9d9d9",
                cursor: cashCollected ? "pointer" : "not-allowed",
              }}
            >
              Mark as Delivered
            </Button>
          </div>
        </div>

        {/* Payment Card */}
        {order.paymentMethod === "Cash on Delivery" && (
          <Card
            title="Cash Payment Information"
            bordered={true}
            style={{
              marginBottom: "20px",
              backgroundColor: "#fffbe6",
              borderColor: "#ffe58f",
            }}
          >
            <p>
              <strong>Amount to Collect:</strong> Rs.{" "}
              {order.totalAmount.toFixed(2)}
            </p>
            <p>
              <strong>Payment Status:</strong> {order.paymentStatus}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>

            {order.paymentStatus === "Pending" && (
              <Button
                type="primary"
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#ffc53d",
                  borderColor: "#ffc53d",
                }}
                onClick={handleCashCollected}
                loading={loading}
              >
                Mark Cash as Collected
              </Button>
            )}
          </Card>
        )}

        <Spin spinning={loading}>
          <div
            style={{
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <DeliveryRoute order={order} />
          </div>
        </Spin>
      </div>
    </Layout>
  );
};

export default DeliveryRoutePage;
