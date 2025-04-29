import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { Button, Card, Table, Tag, Space, Typography, message } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ShopOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { foodServiceApi } from "../../apiClients";
import Swal from "sweetalert2";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const { data } = await foodServiceApi.get("/restaurant?status=pending");
      setPendingRestaurants(data);
      setLoading(false);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch pending restaurants",
        icon: "error",
        confirmButtonColor: "#ff4d4f",
      });
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await foodServiceApi.patch(`/restaurant/${id}/status`, {
        registrationStatus: status,
      });

      message.success(`Restaurant ${status} successfully`);
      fetchPendingRestaurants(); // Refresh the list
    } catch (error) {
      message.error(`Failed to ${status} restaurant`);
    }
  };

  const columns = [
    {
      title: "Restaurant",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {record.logo && (
            <img
              src={record.logo}
              alt="logo"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                marginRight: 12,
                objectFit: "cover",
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary">{record.cuisineType}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Contact",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <Text>
          {record.address.street}, {record.address.city}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color="orange" icon={<LoadingOutlined />}>
          Pending Approval
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleStatusUpdate(record._id, "approved")}
            style={{ backgroundColor: "#52c41a" }}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleStatusUpdate(record._id, "rejected")}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "24px", fontFamily: "'Inter', sans-serif" }}>
        <Card
          title={
            <Space>
              <ShopOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0 }}>
                Restaurant Approvals
              </Title>
            </Space>
          }
          bordered={false}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <LoadingOutlined style={{ fontSize: 32 }} spin />
              <p>Loading pending restaurants...</p>
            </div>
          ) : pendingRestaurants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <ShopOutlined
                style={{ fontSize: "48px", color: "#bfbfbf", marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 8 }}>
                No Pending Approvals
              </Title>
              <Text type="secondary">
                There are no restaurants waiting for approval.
              </Text>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={pendingRestaurants}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
