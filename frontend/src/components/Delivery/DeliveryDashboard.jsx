import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Layout from "../Layout";
import { deliveryServiceApi, cartServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";
import { GoogleMap, Marker } from "@react-google-maps/api";
import ROUTES from "../../routes";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612,
};

const BASE_DELIVERY_URL = import.meta.env.VITE_DELIVERY_BACKEND_URL;

const DeliveryDashboard = () => {
  const [driverStatus, setDriverStatus] = useState("offline");
  const [driver, setDriver] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [todayDeliveries, setTodayDeliveries] = useState(0);
  const [earningsToday, setEarningsToday] = useState(0);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const { user } = useAuth();
  const locationIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.userId) return;

    socketRef.current = io(BASE_DELIVERY_URL || "http://localhost:3001", {
      query: { driverId: user.userId },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    const initializeDriver = async () => {
      try {
        const res = await deliveryServiceApi.get("drivers/me");
        setDriver(res.data);
        setDriverStatus(res.data.status || "offline");
      } catch (error) {
        if (error.response && error.response.status === 404) {
          try {
            const addRes = await deliveryServiceApi.post("drivers/add", {
              driverId: user.userId,
            });
            setDriver(addRes.data);
            setDriverStatus("offline");
            console.log("Driver added successfully");
          } catch (addError) {
            console.error("Failed to add driver", addError);
          }
        } else {
          console.error("Error checking driver existence", error);
        }
      }
    };

    const fetchDeliveryStats = async () => {
      try {
        const res = await cartServiceApi.get("orders/delivery/orders");
        const orders = Array.isArray(res.data) ? res.data : res.data.data || [];

        setTotalDeliveries(orders.length);

        // Find active deliveries
        const activeOrders = orders.filter(
          (order) =>
            order.status === "Out for Delivery" ||
            order.status === "Prepared" ||
            order.status === "Confirmed" ||
            order.status === "Preparing"
        );

        setHasActiveOrder(activeOrders.length > 0);

        const today = new Date().toISOString().split("T")[0];
        const todaysDeliveries = orders.filter((order) => {
          const deliveredDate = new Date(order.updatedAt)
            .toISOString()
            .split("T")[0];
          return order.status === "Delivered" && deliveredDate === today;
        });

        setTodayDeliveries(todaysDeliveries.length);

        const todayEarnings = todaysDeliveries.reduce(
          (total, order) => total + order.totalAmount,
          0
        );
        setEarningsToday(todayEarnings);
      } catch (error) {
        console.error("Failed to fetch delivery stats", error);
      }
    };

    if (user?.userId) {
      initializeDriver();
      fetchDeliveryStats();
    }
  }, [user]);

  const handleChange = async (newStatus) => {
    setDriverStatus(newStatus);

    try {
      const res = await deliveryServiceApi.patch("drivers/update-status", {
        driverId: user.userId,
        status: newStatus,
      });
      setDriver(res.data);
      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          console.log("Current location:", latitude, longitude);
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      console.error("Geolocation not supported");
    }
  };

  const sendLocationToBackend = (latitude, longitude) => {
    if (socketRef.current && socketRef.current.connected) {
      // Send location via WebSocket
      socketRef.current.emit("locationUpdate", {
        driverId: user.userId,
        lat: latitude,
        lng: longitude,
      });
      console.log("Location sent via WebSocket:", latitude, longitude);
    } else {
      // Fallback to HTTP if WebSocket is not available
      deliveryServiceApi
        .patch("drivers/update-location", {
          driverId: user.userId,
          lat: latitude,
          lng: longitude,
        })
        .then(() =>
          console.log("Location updated via HTTP:", latitude, longitude)
        )
        .catch((error) => console.error("Failed to update location", error));
    }
  };

  const startLocationUpdates = () => {
    if (navigator.geolocation) {
      // Get immediate location first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          sendLocationToBackend(latitude, longitude);
        },
        (error) => {
          console.error("Error getting current location", error);
        }
      );

      // Then set up interval for continuous updates
      locationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            sendLocationToBackend(latitude, longitude);
          },
          (error) => {
            console.error("Error getting current location", error);
          },
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      }, 10000); // every 10 seconds
      console.log("Started live location updates...");
    }
  };

  const stopLocationUpdates = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
      console.log("Stopped live location updates.");
    }
  };

  useEffect(() => {
    if (driverStatus === "available") {
      startLocationUpdates();
    } else {
      stopLocationUpdates();
    }

    return () => {
      stopLocationUpdates();
    };
  }, [driverStatus]);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>

        {driver ? (
          <div className="mb-8 p-6 border rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Driver Information
            </h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium text-gray-600">Driver ID:</span>{" "}
                {driver.driverId}
              </p>
              <p>
                <span className="font-medium text-gray-600">Status:</span>{" "}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    driver.status === "available"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {driver.status}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-600">Last Active:</span>{" "}
                {new Date(driver.lastActive).toLocaleString()}
              </p>
            </div>

            {/* Status Toggle */}
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Change Status:
              </label>
              <div
                className={`w-20 flex items-center justify-between p-1 rounded-full cursor-pointer transition-all ${
                  driverStatus === "available" ? "bg-green-400" : "bg-gray-300"
                }`}
                onClick={() => {
                  const newStatus =
                    driverStatus === "available" ? "offline" : "available";
                  handleChange(newStatus);
                }}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white shadow-md transform transition-transform ${
                    driverStatus === "available"
                      ? "translate-x-8"
                      : "translate-x-0"
                  }`}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {driverStatus === "available"
                  ? "You are Available for Deliveries"
                  : "You are Offline"}
              </p>
            </div>

            {hasActiveOrder && (
              <div className="mt-6">
                <button
                  onClick={() => navigate(ROUTES.ORDER_DELIVERY_ROUTE)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded shadow-md transition duration-300"
                >
                  Go to Current Delivery
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">Loading driver details...</p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-600">Total Deliveries</p>
            <h2 className="text-2xl font-semibold">{totalDeliveries}</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-600">Today's Deliveries</p>
            <h2 className="text-2xl font-semibold">{todayDeliveries}</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-600">Earnings Today</p>
            <h2 className="text-2xl font-semibold">
              Rs. {earningsToday.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-4">
          <button
            onClick={handleGetLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded mb-4"
          >
            Get Current Location
          </button>

          <div className="mb-4">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentLocation || defaultCenter}
              zoom={currentLocation ? 15 : 10}
            >
              {currentLocation && <Marker position={currentLocation} />}
            </GoogleMap>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryDashboard;
