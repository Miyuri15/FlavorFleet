import React, { useState, useCallback } from "react";
import { LoadScript } from "@react-google-maps/api";
import axios from "axios";
import MapControls from "./MapControls";
import MapDisplay from "./MapDisplay";
import MapMarker from "./MapMarker";
import Directions from "./Directions";
import { useNavigate } from "react-router-dom";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const DeliveryMap = () => {
  const [map, setMap] = useState(null);
  const [response, setResponse] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [markerPosition, setMarkerPosition] = useState(null);
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  const navigate = useNavigate();

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
        map.panTo(location);
        map.setZoom(15);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

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

      <LoadScript googleMapsApiKey={apiKey}>
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
      </LoadScript>
    </div>
  );
};

export default DeliveryMap;
