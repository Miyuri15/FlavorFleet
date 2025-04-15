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
    <div className="map-controls p-4 bg-white shadow-md rounded-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="input-group">
          <label className="block text-sm font-medium text-gray-700">
            Origin:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={origin}
              onChange={onOriginChange}
              placeholder="Enter starting location"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => onPlaceMarker(origin)}
              disabled={!origin}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              Show on Map
            </button>
          </div>
        </div>

        <div className="input-group">
          <label className="block text-sm font-medium text-gray-700">
            Destination:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={destination}
              onChange={onDestinationChange}
              placeholder="Enter destination"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => onPlaceMarker(destination)}
              disabled={!destination}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              Show on Map
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Get Directions
        </button>
      </form>

      {(distance || duration) && (
        <div className="route-info mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm">
            <strong>Distance:</strong> {distance}
          </p>
          <p className="text-sm">
            <strong>Duration:</strong> {duration}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapControls;
