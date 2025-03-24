import React, { useState } from 'react';

const UserDetailsForm = ({ userDetails, onConfirm, onCancel }) => {
  const [formData, setFormData] = useState(userDetails);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData); // Pass updated details to parent
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Confirm Delivery Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-3">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-4 bg-blue-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-3">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full p-4 bg-blue-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-3">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 bg-blue-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-3">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-4 bg-blue-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Confirm Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserDetailsForm;