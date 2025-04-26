import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { Button, Switch, message, Card, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { foodServiceApi } from "../../../apiClients";

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
      message.success("Restaurant status updated");
      fetchRestaurants();
    } catch (error) {
      message.error("Failed to update status");
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
            >
              Add Restaurant
            </Button>
          </Col>
        </Row>

        {loading ? (
          <p>Loading...</p>
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
                >
                  <p>{restaurant.description}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {restaurant.isAvailable ? "Open" : "Closed"}
                  </p>
                  <p>
                    <strong>Cuisine:</strong> {restaurant.cuisineType}
                  </p>
                  <Button
                    type="link"
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  >
                    View Details
                  </Button>
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
