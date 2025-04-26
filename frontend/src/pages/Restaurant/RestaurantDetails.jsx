import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Image,
  Tag,
  Divider,
  Skeleton,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { foodServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import "./Restaurant.css"; // Optional for custom styles
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
        message.error(
          error.response?.data?.error || "Failed to fetch restaurant"
        );
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
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!confirmed.isConfirmed) return;

      setDeleting(true);
      const response = await foodServiceApi.delete(`/restaurant/${id}`, {});

      if (response.status === 200) {
        Swal.fire("Deleted!", "Restaurant has been deleted.", "success");
        navigate(ROUTES.RESTAURANT_DASHBOARD);
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to delete restaurant",
        text:
          error.response?.data?.error ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Card>
            <Text>Restaurant not found</Text>
          </Card>
        </div>
      </Layout>
    );
  }

  const renderOpeningHours = () => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    return days.map((day) => (
      <Row key={day} gutter={16} style={{ marginBottom: 8 }} className="pt-5">
        <Col span={6}>
          <Text strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</Text>
        </Col>
        <Col span={18}>
          {restaurant.openingHours[day]?.open ? (
            <Text>
              {restaurant.openingHours[day].open} -{" "}
              {restaurant.openingHours[day].close}
            </Text>
          ) : (
            <Text type="secondary">Closed</Text>
          )}
        </Col>
      </Row>
    ));
  };

  return (
    <Layout>
      <div className="restaurant-details-container">
        <Card
          title={
            <Title level={2} style={{ margin: 0 }}>
              {restaurant.name}
            </Title>
          }
          extra={
            <Tag color={restaurant.isAvailable ? "green" : "red"}>
              {restaurant.isAvailable ? "OPEN" : "CLOSED"}
            </Tag>
          }
          cover={
            restaurant.banner ? (
              <Image
                src={restaurant.banner}
                alt={`${restaurant.name} banner`}
                height={300}
                style={{ objectFit: "cover" }}
                preview={false}
              />
            ) : null
          }
          actions={[
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(ROUTES.RESTAURANT_EDIT(id))}
              //need to change colors
              style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
            >
              Edit
            </Button>,
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>,
          ]}
        >
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>About</Title>
                <Paragraph>{restaurant.description}</Paragraph>
              </div>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <Title level={4}>Opening Hours</Title>
                {renderOpeningHours()}
              </div>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <Title level={4}>Contact Information</Title>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={24}>
                    <Text>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      {restaurant.contactNumber}
                    </Text>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={24}>
                    <Text>
                      <MailOutlined style={{ marginRight: 8 }} />
                      {restaurant.email}
                    </Text>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>Location</Title>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={24}>
                    <Text>
                      <EnvironmentOutlined style={{ marginRight: 8 }} />
                      {restaurant.address.street}, {restaurant.address.city},{" "}
                      {restaurant.address.postalCode}
                    </Text>
                  </Col>
                </Row>

                {/* You can add a map component here */}
                <div
                  style={{ height: 200, background: "#f0f0f0", marginTop: 16 }}
                >
                  {/* Placeholder for map */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      color: "#999",
                    }}
                  >
                    Map would display here
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <Title level={4}>Details</Title>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={24}>
                    <Text strong>Cuisine Type: </Text>
                    <Tag>{restaurant.cuisineType}</Tag>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={24}>
                    <Text strong>Delivery Radius: </Text>
                    <Text>{restaurant.deliveryRadius} km</Text>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={24}>
                    <Text strong>Registration Status: </Text>
                    <Tag
                      color={
                        restaurant.registrationStatus === "approved"
                          ? "green"
                          : restaurant.registrationStatus === "pending"
                          ? "orange"
                          : "red"
                      }
                    >
                      {restaurant.registrationStatus.toUpperCase()}
                    </Tag>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Layout>
  );
};

export default RestaurantDetails;
