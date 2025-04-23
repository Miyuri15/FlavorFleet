import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import { deliveryServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";

const DeliveryDashboard = () => {
  const [driverStatus, setDriverStatus] = useState("offline");
  const [driver, setDriver] = useState(null); // holds driver details
  const { user } = useAuth();

  useEffect(() => {
    const initializeDriver = async () => {
      try {
        const res = await deliveryServiceApi.get("/driver/me");
        setDriver(res.data);
        setDriverStatus(res.data.status || "offline");
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Driver not found, add driver
          try {
            const addRes = await deliveryServiceApi.post("/driver/add", {
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
      const res = await deliveryServiceApi.patch("/driver/update-status", {
        driverId: user.userId,
        status: newStatus,
      });
      setDriver(res.data);
      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

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
          className="border px-3 py-2 rounded"
        >
          <option value="available">Available</option>
          <option value="offline">Offline</option>
        </select>
      </div>
    </Layout>
  );
};

export default DeliveryDashboard;
