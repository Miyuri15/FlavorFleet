import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import MapControls from "../../components/Maps/MapControls";
import MapDisplay from "../../components/Maps/MapDisplay";
import MapMarker from "../../components/Maps/MapMarker";
import Directions from "../../components/Maps/Directions";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 6.9147,
  lng: 79.9724,
};

const DeliveryRoute = ({ order }) => {
  const [map, setMap] = useState(null);
  const [response, setResponse] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [markerPosition, setMarkerPosition] = useState(null);
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  const directionsCallback = useCallback((response) => {
    if (response !== null) {
      if (response.status === "OK") {
        setResponse(response);
        setDistance(response.routes[0].legs[0].distance.text);
        setDuration(response.routes[0].legs[0].duration.text);
      } else {
        console.error("Error:", response);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (origin && destination) {
      setResponse(null);
    }
  };

  const handlePlaceMarker = async (address) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        setMarkerPosition(location);
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        } else {
          console.warn("Map is not loaded yet. Cannot pan or set zoom.");
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  // 👇 Auto-setup origin/destination if order is available
  useEffect(() => {
    if (order) {
      const restaurantAddress = `${
        order.restaurantDetails?.address?.street || ""
      }, ${order.restaurantDetails?.address?.city || ""}`;
      const customerAddress = order.deliveryAddress;

      setOrigin(restaurantAddress);
      setDestination(customerAddress);

      setResponse(null); // reset directions to trigger Directions rendering
    }
  }, [order]);

  return (
    <div className="map-container">
      <MapControls
        origin={origin}
        destination={destination}
        distance={distance}
        duration={duration}
        onOriginChange={(e) => setOrigin(e.target.value)}
        onDestinationChange={(e) => setDestination(e.target.value)}
        onPlaceMarker={handlePlaceMarker}
        onSubmit={handleSubmit}
      />

      <MapDisplay
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={(map) => setMap(map)}
        onClick={(e) => {
          setMarkerPosition({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        }}
      >
        <MapMarker position={markerPosition} />
        <Directions
          origin={origin}
          destination={destination}
          response={response}
          onDirectionsCallback={directionsCallback}
        />
      </MapDisplay>
    </div>
  );
};

export default DeliveryRoute;
