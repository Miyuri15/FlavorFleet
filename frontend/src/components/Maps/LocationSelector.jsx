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
    lat: 40.7128, // New York City
    lng: -74.006,
  };

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setSelectedLocation(location);
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  return (
    <div className="location-selector">
      <div className="map-container">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={10}
            onClick={handleMapClick}
          >
            {selectedLocation && <Marker position={selectedLocation} />}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="location-controls">
        {selectedLocation ? (
          <>
            <div className="location-info">
              <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
              <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
            </div>
            <button onClick={handleSaveLocation}>Save Location</button>
          </>
        ) : (
          <p>Click on the map to select a location</p>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
