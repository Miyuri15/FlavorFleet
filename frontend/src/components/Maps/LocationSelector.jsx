import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
};

const LocationSelector = ({ apiKey, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const defaultCenter = {
    lat: 6.9147,
    lng: 79.9724,
  };

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="location-selector">
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedLocation || defaultCenter}
          zoom={10}
          onClick={handleMapClick}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </div>

      <div className="location-controls">
        {selectedLocation ? (
          <div className="location-info">
            <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
            <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
          </div>
        ) : (
          <p>Click on the map to select a location</p>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
