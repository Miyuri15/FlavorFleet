import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Switch,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Space,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { foodServiceApi } from "../../../apiClients";
import Swal from "sweetalert2";
import ROUTES from "../../routes";
import Loading from "../../components/Loading/Loading";

const { Title, Text } = Typography;

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data } = await foodServiceApi.get("/restaurant");
      setRestaurants(data);
      setLoading(false);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch restaurants. Please try again.",
        icon: "error",
        confirmButtonColor: "#ff4d4f",
      });
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      await foodServiceApi.patch(`/restaurant/${id}/availability`, {
        isAvailable: !currentStatus,
      });

      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === id
            ? { ...restaurant, isAvailable: !currentStatus }
            : restaurant
        )
      );

      Swal.fire({
        title: "Success!",
        text: `Restaurant has been ${
          !currentStatus ? "activated" : "deactivated"
        }`,
        icon: "success",
        confirmButtonColor: "#52c41a",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update the restaurant status.",
        icon: "error",
        confirmButtonColor: "#ff4d4f",
      });
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the restaurant and all its menu items!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff4d4f",
        cancelButtonColor: "#1890ff",
        confirmButtonText: "Yes, delete it!",
        customClass: {
          container: "font-sans",
        },
      });

      if (!confirmed.isConfirmed) return;

      await foodServiceApi.delete(`/restaurant/${restaurantId}`);

      setRestaurants(restaurants.filter((r) => r._id !== restaurantId));

      Swal.fire({
        title: "Deleted!",
        text: "Your restaurant has been deleted.",
        icon: "success",
        confirmButtonColor: "#52c41a",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Failed to delete restaurant",
        icon: "error",
        confirmButtonColor: "#ff4d4f",
      });
    }
  };

  return (
    <Layout>
      <div style={{ padding: "24px", fontFamily: "'Inter', sans-serif" }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Space align="center">
              <ShopOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <Title level={2} style={{ margin: 0, color: "#1d1d1f" }}>
                My Restaurants
              </Title>
            </Space>
            <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
              Manage your restaurant establishments
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.ADD_RESTAURANT)}
              style={{
                backgroundColor: "#1890ff",
                fontWeight: 500,
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.2)",
              }}
              size="large"
            >
              Add Restaurant
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Loading />
        ) : restaurants.length === 0 ? (
          <Card
            style={{
              textAlign: "center",
              padding: "40px 24px",
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ShopOutlined
              style={{
                fontSize: "48px",
                color: "#bfbfbf",
                marginBottom: "16px",
              }}
            />
            <Title level={4} style={{ marginBottom: "8px" }}>
              No Restaurants Yet
            </Title>
            <Text type="secondary" style={{ marginBottom: "24px" }}>
              You haven't added any restaurants yet. Get started by adding your
              first establishment.
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.ADD_RESTAURANT)}
              style={{
                backgroundColor: "#1890ff",
                fontWeight: 500,
              }}
            >
              Add Your First Restaurant
            </Button>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {restaurants.map((restaurant) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={restaurant._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    overflow: "hidden",
                  }}
                  cover={
                    <div
                      style={{
                        height: "160px",
                        backgroundColor: "#f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {restaurant.banner ? (
                        <Image
                          src={restaurant.banner}
                          alt={restaurant.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          preview={false}
                        />
                      ) : (
                        <ShopOutlined
                          style={{ fontSize: "48px", color: "#bfbfbf" }}
                        />
                      )}
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() =>
                        navigate(ROUTES.RESTAURANT_DETAILS(restaurant._id))
                      }
                      key="edit"
                    >
                      Manage
                    </Button>,
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteRestaurant(restaurant._id)}
                      key="delete"
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    {restaurant.logo && (
                      <Image
                        src={restaurant.logo}
                        alt="logo"
                        width={50}
                        height={50}
                        style={{ borderRadius: "50%", marginRight: "12px" }}
                        preview={false}
                      />
                    )}
                    <Title
                      level={4}
                      style={{
                        marginBottom: 0,
                        color: "#1d1d1f",
                        fontWeight: 600,
                      }}
                    >
                      {restaurant.name}
                    </Title>
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      marginBottom: "12px",
                      fontSize: "14px",
                    }}
                  >
                    {restaurant.description || "No description provided"}
                  </Text>

                  <Space size={[8, 8]} wrap style={{ marginBottom: "16px" }}>
                    <Tag color={restaurant.isAvailable ? "green" : "red"}>
                      {restaurant.isAvailable ? "Open" : "Closed"}
                    </Tag>
                    <Tag color="blue">{restaurant.cuisineType}</Tag>
                    {restaurant.registrationStatus === "approved" ? (
                      <Tag color="success">Verified</Tag>
                    ) : (
                      <Tag color="warning">Pending Approval</Tag>
                    )}
                  </Space>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong style={{ fontSize: "14px" }}>
                      Availability:
                    </Text>
                    <Switch
                      checked={restaurant.isAvailable}
                      onChange={() =>
                        handleStatusChange(
                          restaurant._id,
                          restaurant.isAvailable
                        )
                      }
                      checkedChildren="ON"
                      unCheckedChildren="OFF"
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Layout>
  );
};

export default RestaurantDashboard;
