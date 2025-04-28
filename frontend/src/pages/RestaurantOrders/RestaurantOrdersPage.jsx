import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Spin, Button, Select } from "antd";
import { cartServiceApi, foodServiceApi } from "../../../apiClients";
import Layout from "../../components/Layout";
import { CopyOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RestaurantOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data } = await foodServiceApi.get("/restaurant");
      setRestaurants(data);
    } catch (error) {
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (restaurantId) => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await cartServiceApi.get("orders/restaurant/orders", {
        params: { restaurantId },
      });
      setOrders(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchOrders(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const handleRestaurantChange = (value) => {
    setSelectedRestaurantId(value);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await cartServiceApi.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(selectedRestaurantId);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to update order status"
      );
    }
  };

  const notifyNearbyDeliveryAgents = async (orderId, restaurantId) => {
    try {
      const response = await cartServiceApi.post(
        `/orders/${orderId}/notify-delivery-agents`,
        {
          restaurantId,
        }
      );
      toast.success("Nearby delivery agents have been notified!");
      fetchOrders(selectedRestaurantId);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to notify nearby delivery agents"
      );
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId) =>
        orderId ? (
          <Space>
            <span>{`#${orderId
              .substring(orderId.length - 6)
              .toUpperCase()}`}</span>
            <CopyOutlined
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                toast.success("Order ID copied!");
              }}
            />
          </Space>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>{record.customerName}</div>
          <div className="text-muted">{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <div>
          {items.map((item, index) => (
            <div key={index}>
              {item.quantity}x {item.name} (${item.price})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `Rs. ${amount.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const statusMap = {
          Pending: { color: "orange", text: "Pending" },
          Confirmed: { color: "blue", text: "Confirmed" },
          Preparing: { color: "gold", text: "Preparing" },
          Prepared: { color: "cyan", text: "Prepared" },
          "Out for Delivery": { color: "geekblue", text: "Out for Delivery" },
          Delivered: { color: "green", text: "Delivered" },
          Cancelled: { color: "red", text: "Cancelled" },
        };

        return (
          <Space direction="vertical">
            <Tag color={statusMap[record.status]?.color || "gray"}>
              {statusMap[record.status]?.text || record.status}
            </Tag>
            {/* Delivery assignment status */}
            {record.status === "Prepared" ||
            record.status === "Out for Delivery" ? (
              record.deliveryAgentId ? (
                <Tag color="green">Delivery Agent Assigned</Tag>
              ) : (
                <Tag color="volcano">Waiting for Delivery Agent</Tag>
              )
            ) : null}
          </Space>
        );
      },
    },
    {
      title: "Order Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "Pending" && (
            <Button
              onClick={() => handleStatusUpdate(record.orderId, "Confirmed")}
            >
              Confirm Order
            </Button>
          )}
          {record.status === "Confirmed" && (
            <Button
              onClick={() => handleStatusUpdate(record.orderId, "Preparing")}
            >
              Start Preparing
            </Button>
          )}
          {record.status === "Preparing" && (
            <Button
              onClick={() => handleStatusUpdate(record.orderId, "Prepared")}
            >
              Mark as Prepared
            </Button>
          )}
          {record.status === "Prepared" && (
            <Button
              onClick={() =>
                notifyNearbyDeliveryAgents(record.orderId, selectedRestaurantId)
              }
            >
              Notify Nearby Delivery Agents
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div className="restaurant-orders-page">
        <h1>Restaurant Orders</h1>

        <div style={{ marginBottom: 20 }}>
          <Select
            placeholder="Select a Restaurant"
            value={selectedRestaurantId}
            onChange={handleRestaurantChange}
            style={{ width: 300 }}
            loading={loading}
            allowClear
          >
            {restaurants.map((restaurant) => (
              <Select.Option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="orderId"
            scroll={{ x: true }}
          />
        </Spin>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Layout>
  );
};

export default RestaurantOrdersPage;
