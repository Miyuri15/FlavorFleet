import React, { useState } from "react";
import LocationSelector from "../Maps/LocationSelector";

const ResidenceForm = ({ residence, onInputChange, onSubmit, onCancel }) => {
  const [savedLocations, setSavedLocations] = useState([]);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const handleLocationSelect = (location) => {
    setSavedLocations([...savedLocations, location]);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg shadow dark:shadow-gray-800">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
        Update Residence
      </h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label
            htmlFor="residence"
            className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
          >
            New Residence
          </label>
          <input
            type="text"
            id="residence"
            name="residence"
            value={residence}
            onChange={onInputChange}
            className="w-full p-2 border rounded bg-white dark:bg-primary-dark text-text-light dark:text-text-dark border-secondary-light dark:border-accent-dark focus:ring-2 focus:ring-button-light dark:focus:ring-accent-dark focus:border-transparent"
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-button-light text-white rounded hover:bg-blue-700 dark:bg-accent-dark dark:hover:bg-accent-light transition-colors"
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

      <div className="location-manager">
        <h2>Select and Save Locations</h2>
        <LocationSelector
          apiKey={apiKey}
          onLocationSelect={handleLocationSelect}
        />

        <div className="saved-locations">
          <h3>Saved Locations</h3>
          {savedLocations.length > 0 ? (
            <ul>
              {savedLocations.map((loc, index) => (
                <li key={index}>
                  Location {index + 1}: {loc.lat.toFixed(6)},{" "}
                  {loc.lng.toFixed(6)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No locations saved yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidenceForm;
