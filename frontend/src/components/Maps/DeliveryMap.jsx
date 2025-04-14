import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 6.053, // default center if driver location is not available
  lng: 80.221,
};

const GOOGLE_MAPS_API_KEY = "AIzaSyCU5D--1P_O28suxXMI6auENL1AONQNF2s";

const DeliveryMap = ({ driverLocation, deliveryLocation }) => {
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState("");
  const [distance, setDistance] = useState("");

  useEffect(() => {
    if (!driverLocation || !deliveryLocation) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: driverLocation,
        destination: deliveryLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setEta(leg.duration.text);
          setDistance(leg.distance.text);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  }, [driverLocation, deliveryLocation]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverLocation || center}
        zoom={14}
      >
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      {eta && distance && (
        <div style={{ marginTop: "10px", fontSize: "16px" }}>
          <strong>ETA:</strong> {eta} | <strong>Distance:</strong> {distance}
        </div>
      )}
    </LoadScript>
  );
};

export default DeliveryMap;
