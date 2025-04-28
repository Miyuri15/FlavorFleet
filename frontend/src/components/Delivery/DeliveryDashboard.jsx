import React, { useState, useEffect, useRef } from "react";
import Layout from "../Layout";
import { deliveryServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";
import { GoogleMap, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 6.9271, // Default center (Colombo)
  lng: 79.8612,
};

const DeliveryDashboard = () => {
  const [driverStatus, setDriverStatus] = useState("offline");
  const [driver, setDriver] = useState(null);
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationIntervalRef = useRef(null);

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

    if (user?.userId) {
      initializeDriver();
    }
  }, [user]);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
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
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const sendLocationToBackend = async (latitude, longitude) => {
    try {
      await deliveryServiceApi.patch("drivers/update-location", {
        driverId: user.userId,
        lat: latitude,
        lng: longitude,
      });
      console.log("Location updated to backend:", latitude, longitude);
    } catch (error) {
      console.error("Failed to update location", error);
    }
  };

  const startLocationUpdates = () => {
    if (navigator.geolocation) {
      locationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            sendLocationToBackend(latitude, longitude); // Send to backend
          },
          (error) => {
            console.error("Error getting current location", error);
          }
        );
      }, 10000); // every 10 seconds
      console.log("Started sending live location updates...");
    } else {
      console.error("Geolocation not supported");
    }
  };

  const stopLocationUpdates = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
      console.log("Stopped live location updates.");
    }
  };

  // Watch driver status
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
        <h1 className="text-xl font-semibold mb-4">Delivery Dashboard</h1>

        {driver ? (
          <div className="mb-4 border p-4 rounded bg-gray-50">
            <p>
              <strong>Driver ID:</strong> {driver.driverId}
            </p>
            <p>
              <strong>Status:</strong> {driver.status}
            </p>
            <p>
              <strong>Last Active:</strong>{" "}
              {new Date(driver.lastActive).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="mb-4 text-gray-500">Loading driver details...</p>
        )}

        <label className="block mb-2">Change Status:</label>
        <select
          value={driverStatus}
          onChange={handleChange}
          className="border px-3 py-2 rounded mb-4"
        >
          <option value="available">Available</option>
          <option value="offline">Offline</option>
        </select>

        <div className="mb-4">
          <button
            onClick={handleGetLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
          >
            Get Current Location
          </button>
        </div>

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
    </Layout>
  );
};

export default DeliveryDashboard;
