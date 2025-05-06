import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Spin, Button, Select, Card } from "antd";
import { cartServiceApi, foodServiceApi } from "../../../apiClients";
import Layout from "../../components/Layout";
import { CopyOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const RestaurantOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
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
    setSelectedStatus(null); // Clear status filter on restaurant change
  };

  const handleStatusFilter = (value) => {
    setSelectedStatus(value);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await cartServiceApi.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(selectedRestaurantId);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to update order status"
      );
    } finally {
      setLoading(false);
    }
  };

  const notifyNearbyDeliveryAgents = async (orderId) => {
    try {
      setLoading(true);
      await cartServiceApi.post(`/orders/${orderId}/notify-delivery-agents`, {
        restaurantId: selectedRestaurantId,
      });
      toast.success("Nearby delivery agents have been notified!");
      fetchOrders(selectedRestaurantId);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to notify delivery agents"
      );
    } finally {
      setLoading(false);
    }
  };

  // Status colors map
  const statusMap = {
    Pending: { color: "orange", text: "Pending" },
    Confirmed: { color: "blue", text: "Confirmed" },
    Preparing: { color: "gold", text: "Preparing" },
    Prepared: { color: "cyan", text: "Prepared" },
    "Out for Delivery": { color: "geekblue", text: "Out for Delivery" },
    Delivered: { color: "green", text: "Delivered" },
    Cancelled: { color: "red", text: "Cancelled" },
  };

  // Apply filter if selected
  const filteredOrders = selectedStatus
    ? orders.filter((order) => order.status === selectedStatus)
    : orders;

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId) => (
        <Space>
          <span>{`#${orderId?.slice(-6).toUpperCase()}`}</span>
          <CopyOutlined
            style={{ cursor: "pointer", color: "#1890ff" }}
            onClick={() => {
              navigator.clipboard.writeText(orderId);
              toast.success("Order ID copied!");
            }}
          />
        </Space>
      ),
    },
    {
      title: "Customer",
      render: (_, record) => (
        <div>
          <div>{record.customerName}</div>
          <div className="text-muted text-xs">{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items) => (
        <div>
          {items.map((item, idx) => (
            <div key={idx}>
              {item.quantity}x {item.name} (Rs. {item.price})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (amount) => `Rs. ${amount.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status, record) => (
        <Space direction="vertical">
          <Tag color={statusMap[status]?.color || "gray"}>
            {statusMap[status]?.text || status}
          </Tag>
          {(status === "Prepared" || status === "Out for Delivery") &&
            (record.deliveryAgentId ? (
              <Tag color="green">Delivery Assigned</Tag>
            ) : (
              <Tag color="volcano">Awaiting Delivery</Tag>
            ))}
        </Space>
      ),
    },
    {
      title: "Order Time",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space wrap>
          {record.status === "Pending" && (
            <Button
              type="primary"
              onClick={() => handleStatusUpdate(record.orderId, "Confirmed")}
            >
              Confirm
            </Button>
          )}
          {record.status === "Confirmed" && (
            <Button
              type="default"
              onClick={() => handleStatusUpdate(record.orderId, "Preparing")}
            >
              Start Preparing
            </Button>
          )}
          {record.status === "Preparing" && (
            <Button
              type="dashed"
              onClick={() => handleStatusUpdate(record.orderId, "Prepared")}
            >
              Mark Prepared
            </Button>
          )}
          {record.status === "Prepared" && (
            <Button
              danger
              onClick={() => notifyNearbyDeliveryAgents(record.orderId)}
            >
              Notify Delivery Agents
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        <Card
          title="Restaurant Orders Management"
          bordered={false}
          className="shadow-lg rounded-2xl bg-white"
        >
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              placeholder="Select a Restaurant"
              value={selectedRestaurantId}
              onChange={handleRestaurantChange}
              style={{ width: 300 }}
              loading={loading}
              allowClear
            >
              {restaurants.map((r) => (
                <Option key={r._id} value={r._id}>
                  {r.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Status"
              value={selectedStatus}
              onChange={handleStatusFilter}
              style={{ width: 200 }}
              allowClear
            >
              {Object.keys(statusMap).map((status) => (
                <Option key={status} value={status}>
                  {statusMap[status].text}
                </Option>
              ))}
            </Select>
          </div>

          {/* Orders Table */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredOrders}
              rowKey="orderId"
              scroll={{ x: true }}
              bordered
              pagination={{ pageSize: 8 }}
            />
          </Spin>
        </Card>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
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
