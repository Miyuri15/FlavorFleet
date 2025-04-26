import React, { useState, useCallback } from "react";
import MapDisplay from "../Maps/MapDisplay";
import MapMarker from "../Maps/MapMarker";

const ResidenceForm = ({ onSubmit, onCancel, residence, address }) => {
  const [place, setPlace] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (
      residence?.coordinates &&
      residence.coordinates.length === 2 &&
      typeof residence.coordinates[0] === "number" &&
      typeof residence.coordinates[1] === "number"
    ) {
      return { lat: residence.coordinates[1], lng: residence.coordinates[0] };
    }
    return null;
  });
  const [map, setMap] = useState(null);

  const containerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "8px",
  };

  const defaultCenter = {
    lat: 6.9147,
    lng: 79.9724,
  };

  const handleShowOnMap = useCallback(async () => {
    if (!place.trim() || !window.google) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: place }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const newLocation = {
            lat: location.lat(),
            lng: location.lng(),
          };
          setSelectedLocation(newLocation);
          if (map) {
            map.panTo(newLocation);
            map.setZoom(15);
          }
        } else {
          console.error("Geocode was not successful:", status);
          alert(
            "Could not find the location. Please try a more specific address."
          );
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error finding location. Please try again.");
    }
  }, [place, map]);

  const handleMapClick = useCallback((e) => {
    const clickedLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setSelectedLocation(clickedLocation);

    // Reverse geocode to get address
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: clickedLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          setPlace(results[0].formatted_address);
        }
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedLocation) {
      onSubmit({ place, location: selectedLocation });
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg shadow dark:shadow-gray-800">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
        Update Residence
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="place"
            className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
          >
            Place
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="place"
              name="place"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Enter a place or address"
              className="flex-1 p-2 border rounded bg-white dark:bg-primary-dark text-text-light dark:text-text-dark border-secondary-light dark:border-accent-dark focus:ring-2 focus:ring-button-light dark:focus:ring-accent-dark focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={handleShowOnMap}
              disabled={!place.trim()}
              className="px-4 py-2 bg-button-light text-white rounded hover:bg-blue-700 dark:bg-accent-dark dark:hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show on Map
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-2">
            Location Selection
          </h3>

          <MapDisplay
            mapContainerStyle={containerStyle}
            center={selectedLocation || defaultCenter}
            zoom={selectedLocation ? 15 : 10}
            onLoad={(map) => setMap(map)}
            onClick={handleMapClick}
          >
            {selectedLocation && <MapMarker position={selectedLocation} />}
          </MapDisplay>
        </div>

        {selectedLocation && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-1">
              Selected Location
            </h3>
            <p className="text-text-light dark:text-text-dark">
              Address: {place || address || "Not specified"}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={!selectedLocation}
            className="px-4 py-2 bg-button-light text-white rounded hover:bg-blue-700 dark:bg-accent-dark dark:hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-secondary-light text-text-light rounded hover:bg-accent-light dark:bg-secondary-dark dark:text-text-dark dark:hover:bg-accent-dark transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidenceForm;
