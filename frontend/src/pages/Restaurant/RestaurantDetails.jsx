import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Skeleton,
  Tag,
  Space,
  Image,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { foodServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import ROUTES from "../../routes";
import Layout from "../../components/Layout";

const { Title, Text, Paragraph } = Typography;

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await foodServiceApi.get(`/restaurant/${id}`);
        if (response.status === 200) {
          setRestaurant(response.data);
        } else {
          message.error("Failed to fetch restaurant details");
          navigate(ROUTES.RESTAURANT_DASHBOARD);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.error || "Failed to fetch restaurant",
          icon: "error",
          confirmButtonColor: "#ff4d4f",
        });
        navigate(ROUTES.RESTAURANT_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the restaurant and all its menu items!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff4d4f",
        cancelButtonColor: "#1890ff",
        confirmButtonText: "Yes, delete it!",
      });

      if (!confirmed.isConfirmed) return;

      setDeleting(true);
      const response = await foodServiceApi.delete(`/restaurant/${id}`, {});

      if (response.status === 200) {
        Swal.fire({
          title: "Deleted!",
          text: "Restaurant has been deleted.",
          icon: "success",
          confirmButtonColor: "#52c41a",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(ROUTES.RESTAURANT_DASHBOARD);
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Failed to delete restaurant",
        icon: "error",
        confirmButtonColor: "#ff4d4f",
      });
    } finally {
      setDeleting(false);
    }
  };

  const renderOpeningHours = () => {
    const days = [
      { name: "Monday", key: "monday" },
      { name: "Tuesday", key: "tuesday" },
      { name: "Wednesday", key: "wednesday" },
      { name: "Thursday", key: "thursday" },
      { name: "Friday", key: "friday" },
      { name: "Saturday", key: "saturday" },
      { name: "Sunday", key: "sunday" },
    ];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {days.map((day) => (
          <div key={day.key} style={{ display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            <Text strong style={{ minWidth: "80px" }}>
              {day.name}:
            </Text>
            {restaurant.openingHours[day.key]?.open ? (
              <Text>
                {restaurant.openingHours[day.key].open} -{" "}
                {restaurant.openingHours[day.key].close}
              </Text>
            ) : (
              <Text type="secondary">Closed</Text>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
          <Card>
            <Space
              direction="vertical"
              align="center"
              style={{ width: "100%", padding: "40px 0" }}
            >
              <ShopOutlined style={{ fontSize: "48px", color: "#bfbfbf" }} />
              <Title level={4}>Restaurant not found</Title>
              <Button
                type="primary"
                onClick={() => navigate(ROUTES.RESTAURANT_DASHBOARD)}
              >
                Back to Dashboard
              </Button>
            </Space>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 1px 8px rgba(0, 0, 0, 0.1)",
          }}
          cover={
            <div
              style={{
                height: "300px",
                backgroundColor: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <ShopOutlined style={{ fontSize: "64px", color: "#bfbfbf" }} />
              )}
            </div>
          }
          actions={[
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(ROUTES.RESTAURANT_EDIT(id))}
              style={{
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
                fontWeight: 500,
              }}
              size="large"
              block
            >
              Edit Restaurant
            </Button>,
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
              size="large"
              block
            >
              Delete Restaurant
            </Button>,
          ]}
        >
          <div style={{ marginBottom: "24px" }}>
            <Space align="center" style={{ marginBottom: "8px" }}>
              <Title level={2} style={{ margin: 0 }}>
                {restaurant.name}
              </Title>
              <Tag
                color={restaurant.isAvailable ? "green" : "red"}
                style={{
                  fontSize: "14px",
                  padding: "4px 8px",
                  fontWeight: 600,
                }}
              >
                {restaurant.isAvailable ? "OPEN" : "CLOSED"}
              </Tag>
            </Space>

            <Space size={[8, 8]} wrap style={{ marginBottom: "16px" }}>
              <Tag color="blue" icon={<ShopOutlined />}>
                {restaurant.cuisineType}
              </Tag>
              <Tag
                color={
                  restaurant.registrationStatus === "approved"
                    ? "green"
                    : restaurant.registrationStatus === "pending"
                    ? "orange"
                    : "red"
                }
                icon={<StarOutlined />}
              >
                {restaurant.registrationStatus.toUpperCase()}
              </Tag>
              <Tag color="geekblue">
                {restaurant.deliveryRadius} km delivery
              </Tag>
            </Space>

            <Paragraph style={{ fontSize: "16px", color: "#1d1d1f" }}>
              {restaurant.description || "No description provided"}
            </Paragraph>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Title level={4} style={{ marginBottom: "16px" }}>
                <ClockCircleOutlined style={{ marginRight: "8px" }} />
                Opening Hours
              </Title>
              {renderOpeningHours()}
            </Col>

            <Col xs={24} md={12}>
              <Title level={4} style={{ marginBottom: "16px" }}>
                <EnvironmentOutlined style={{ marginRight: "8px" }} />
                Location
              </Title>
              <div style={{ marginBottom: "16px" }}>
                <Text strong>Address:</Text>
                <Paragraph style={{ marginTop: "8px" }}>
                  {restaurant.address.street}, {restaurant.address.city},{" "}
                  {restaurant.address.postalCode}
                </Paragraph>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Text strong>Contact:</Text>
                <Paragraph style={{ marginTop: "8px" }}>
                  <Space direction="vertical">
                    <Text>
                      <PhoneOutlined style={{ marginRight: "8px" }} />
                      {restaurant.contactNumber}
                    </Text>
                    <Text>
                      <MailOutlined style={{ marginRight: "8px" }} />
                      {restaurant.email}
                    </Text>
                  </Space>
                </Paragraph>
              </div>

              {/* Map placeholder */}
              <div
                style={{
                  height: "200px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  marginTop: "16px",
                }}
              >
                <Text>Map would be displayed here</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Layout>
  );
};

export default RestaurantDetails;
