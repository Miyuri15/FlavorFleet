import React from "react";

const ResidenceForm = ({ residence, onInputChange, onSubmit, onCancel }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Update Residence
      </h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label
            htmlFor="residence"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Residence
          </label>
          <input
            type="text"
            id="residence"
            name="residence"
            value={residence}
            onChange={onInputChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidenceForm;
