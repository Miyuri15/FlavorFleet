import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Spin, Button, Select } from "antd";
import { cartServiceApi } from "../../../apiClients";
import Layout from "../../components/Layout";
import { CopyOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../routes";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const DeliveryOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [nearbyResponse, assignedResponse] = await Promise.all([
        cartServiceApi.get("orders/nearby"),
        cartServiceApi.get("orders/delivery/orders"),
      ]);

      const nearbyOrders = Array.isArray(nearbyResponse.data)
        ? nearbyResponse.data
        : nearbyResponse.data.data || [];

      const assignedOrders = Array.isArray(assignedResponse.data)
        ? assignedResponse.data
        : assignedResponse.data.data || [];

      const mergedOrders = [...nearbyOrders, ...assignedOrders];

      const uniqueOrders = mergedOrders.reduce((acc, current) => {
        if (!acc.find((order) => order._id === current._id)) {
          acc.push(current);
        }
        return acc;
      }, []);

      setOrders(uniqueOrders);
      applyFilter(uniqueOrders, statusFilter);
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

  const applyFilter = (ordersList, status) => {
    if (status === "All") {
      setFilteredOrders(ordersList);
    } else {
      const filtered = ordersList.filter((order) => order.status === status);
      setFilteredOrders(filtered);
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    applyFilter(orders, value);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true);
      await cartServiceApi.post(`/orders/${orderId}/accept-delivery`);
      toast.success("Order accepted successfully!");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to accept order");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      setLoading(true);
      await cartServiceApi.patch(`/orders/${orderId}/status`, {
        status: "Delivered",
      });
      toast.success("Order marked as Delivered!");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (order) => {
    navigate(ROUTES.ORDER_DELIVERY_ROUTE, { state: { order } });
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
      dataIndex: ["restaurantDetails", "name"],
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
          Prepared: "gold",
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
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              onClick={() => handleAcceptOrder(record._id)}
            >
              Accept Delivery
            </Button>
          )}
          {record.status === "Out for Delivery" && (
            <>
              <Button
                style={{
                  backgroundColor: "#FF9800",
                  borderColor: "#FF9800",
                  color: "#fff",
                }}
                onClick={() => handleMarkDelivered(record._id)}
              >
                Mark as Delivered
              </Button>
              <Button onClick={() => handleNavigate(record)}>Navigate</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div className="delivery-orders-page" style={{ padding: "1rem" }}>
        <h1>Incoming and Assigned Delivery Orders</h1>

        {/* Status Filter */}
        <div style={{ marginBottom: "1rem" }}>
          <Select
            defaultValue="All"
            style={{ width: 200 }}
            onChange={handleStatusChange}
          >
            <Option value="All">All</Option>
            <Option value="Prepared">Prepared</Option>
            <Option value="Out for Delivery">Out for Delivery</Option>
            <Option value="Delivered">Delivered</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredOrders}
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
