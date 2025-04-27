import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { Button, Switch, message, Card, Row, Col, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { foodServiceApi } from "../../../apiClients";
import Swal from "sweetalert2";
import ROUTES from "../../routes";
import Loading from "../../components/Loading/Loading";

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
      message.error("Failed to fetch restaurants");
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      await foodServiceApi.patch(`/restaurant/${id}/availability`, {
        isAvailable: !currentStatus,
      });
      Swal.fire(
        "Updated!",
        "Your restaurant status has been updated.",
        "success"
      );

      fetchRestaurants();
    } catch (error) {
      Swal.fire("Error!", "Failed to update the restaurant status.", "error");
    }
  };

  // Add this to your component
  const handleDeleteRestaurant = async (restaurantId) => {
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

      const response = await foodServiceApi.delete(
        `/restaurant/${restaurantId}`
      );

      setRestaurants(restaurants.filter((r) => r._id !== restaurantId));
      Swal.fire("Deleted!", "Your restaurant has been deleted.", "success");
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
    }
  };

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <h1>Restaurant Dashboard</h1>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/add-restaurant")}
              style={{
                backgroundColor: "#1890ff", // Explicit primary color
                color: "white",
                border: "none",
                boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)",
              }}
            >
              Add Restaurant
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Loading />
        ) : (
          <Row gutter={[16, 16]}>
            {restaurants.map((restaurant) => (
              <Col xs={24} sm={12} md={8} lg={6} key={restaurant._id}>
                <Card
                  title={restaurant.name}
                  extra={
                    <Switch
                      checked={restaurant.isAvailable}
                      onChange={() =>
                        handleStatusChange(
                          restaurant._id,
                          restaurant.isAvailable
                        )
                      }
                    />
                  }
                  actions={[
                    <Button
                      type="link"
                      onClick={() =>
                        navigate(ROUTES.RESTAURANT_DETAILS(restaurant._id))
                      }
                      key="view"
                    >
                      View Details
                    </Button>,
                    <Button
                      type="text"
                      danger
                      onClick={() => handleDeleteRestaurant(restaurant._id)}
                      key="delete"
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <p>{restaurant.description}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {restaurant.isAvailable ? (
                      <Tag color="green">Open</Tag>
                    ) : (
                      <Tag color="red">Closed</Tag>
                    )}
                  </p>
                  <p>
                    <strong>Cuisine:</strong>{" "}
                    <Tag>{restaurant.cuisineType}</Tag>
                  </p>
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
