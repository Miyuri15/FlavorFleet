import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Spin, Button } from "antd";
import { cartServiceApi } from "../../../apiClients";
import Layout from "../../components/Layout";
import { CopyOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

const DeliveryOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await cartServiceApi.get("orders/delivery/incoming");
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchOrders();
    }
  }, [user]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await cartServiceApi.patch(`/orders/${orderId}/status`, {
        status: "Out for Delivery",
      });
      toast.success("Order accepted!");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to accept order");
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await cartServiceApi.patch(`/orders/${orderId}/status`, {
        status: "Delivered",
      });
      toast.success("Order marked as Delivered!");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update order");
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <Space>
          <span>{`#${id.substring(id.length - 6).toUpperCase()}`}</span>
          <CopyOutlined
            style={{ cursor: "pointer", color: "#1890ff" }}
            onClick={() => {
              navigator.clipboard.writeText(id);
              toast.success("Order ID copied!");
            }}
          />
        </Space>
      ),
    },
    {
      title: "Restaurant",
      dataIndex: ["restaurantId", "name"],
      key: "restaurant",
    },
    {
      title: "Delivery Address",
      dataIndex: "deliveryAddress",
      key: "deliveryAddress",
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
      render: (status) => {
        const statusColors = {
          Confirmed: "blue",
          "Out for Delivery": "geekblue",
          Delivered: "green",
          Cancelled: "red",
        };
        return <Tag color={statusColors[status] || "gray"}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "Prepared" && (
            <Button
              type="primary"
              onClick={() =>
                handleStatusUpdate(record.orderId, "Out for Delivery")
              }
            >
              Accept Delivery
            </Button>
          )}
          {record.status === "Out for Delivery" && (
            <Button
              type="primary"
              onClick={() => handleStatusUpdate(record.orderId, "Delivered")}
            >
              Mark as Delivered
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div className="delivery-orders-page">
        <h1>Incoming Delivery Orders</h1>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
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

export default DeliveryOrdersPage;
