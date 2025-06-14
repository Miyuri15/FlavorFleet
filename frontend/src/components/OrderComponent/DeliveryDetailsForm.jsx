import { useEffect, useState } from "react";
import api from "../../../api";

export default function DeliveryDetailsForm({
  onDetailsSubmit,
  onPaymentMethodSelect,
  paymentMethod,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNo: "",
    address: "",
    city: "",
    postalCode: "",
    specialInstructions: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get(`/auth/current`);
        const user = response.data;

        const { city, postalCode } = parseAddress(user?.address);

        setFormData({
          fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          contactNo: user?.contactNumber || "",
          address: user?.address || "",
          city, // Parsed city
          postalCode, // Parsed postalCode
          specialInstructions: "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.address || !formData.city) {
      alert("Please fill complete address details");
      return;
    }
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.postalCode}`;
    onDetailsSubmit({ ...formData, address: fullAddress });
  };

  const parseAddress = (fullAddress) => {
    if (!fullAddress) {
      return { city: "", postalCode: "" };
    }

    try {
      const parts = fullAddress.split(",");

      // Pick the part before country (example: "Galle 80000")
      const secondLastPart = parts[parts.length - 2]?.trim() || "";

      // Use regex to separate city and postal code
      const match = secondLastPart.match(/^(.+?)\s(\d{4,6})$/);

      if (match) {
        const city = match[1]; // city name
        const postalCode = match[2]; // postal code
        return { city, postalCode };
      } else {
        return { city: "", postalCode: "" };
      }
    } catch (error) {
      console.error("Error parsing address:", error);
      return { city: "", postalCode: "" };
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium  text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border bg-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              className="w-full px-4 py-2 border bg-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border bg-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border bg-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border bg-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions
            </label>
            <textarea
              name="specialInstructions"
              rows="3"
              value={formData.specialInstructions}
              onChange={handleChange}
              className="w-full px-4 py-2 border bg-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Delivery Details
          </button>
        </div>
      </form>

      {formData.fullName && formData.address && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => onPaymentMethodSelect("cash")}
              className={`flex-1 py-3 rounded-md border-2 ${
                paymentMethod === "cash"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
            >
              Cash on Delivery
            </button>
            <button
              onClick={() => onPaymentMethodSelect("card")}
              className={`flex-1 py-3 rounded-md border-2 ${
                paymentMethod === "card"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
