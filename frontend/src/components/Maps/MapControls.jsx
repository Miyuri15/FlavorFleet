import React from "react";

const MapControls = ({
  origin,
  destination,
  distance,
  duration,
  onOriginChange,
  onDestinationChange,
  onPlaceMarker,
  onSubmit,
}) => {
  return (
    <div className="map-controls">
      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label>Origin:</label>
          <input
            type="text"
            value={origin}
            onChange={onOriginChange}
            placeholder="Enter starting location"
          />
          <button
            type="button"
            onClick={() => onPlaceMarker(origin)}
            disabled={!origin}
          >
            Show on Map
          </button>
        </div>

        <div className="input-group">
          <label>Destination:</label>
          <input
            type="text"
            value={destination}
            onChange={onDestinationChange}
            placeholder="Enter destination"
          />
          <button
            type="button"
            onClick={() => onPlaceMarker(destination)}
            disabled={!destination}
          >
            Show on Map
          </button>
        </div>

        <button type="submit">Get Directions</button>
      </form>

      {(distance || duration) && (
        <div className="route-info">
          <p>
            <strong>Distance:</strong> {distance}
          </p>
          <p>
            <strong>Duration:</strong> {duration}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapControls;
