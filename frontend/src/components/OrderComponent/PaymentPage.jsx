import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import Swal from "sweetalert2"; // Import SweetAlert2
import UserDetailsForm from "./UserDetailsForm"; // Import UserDetailsForm
import Layout from "../Layout";

const PaymentPage = () => {
  const location = useLocation(); // Get location state
  const navigate = useNavigate(); // Initialize useNavigate

  // Get cart and total price from location state
  const { cart, totalPrice } = location.state;

  // Logged-in user details (dummy data)
  const [userDetails, setUserDetails] = useState({
    fullName: "John Doe",
    contactNumber: "123-456-7890",
    email: "john.doe@example.com",
    address: "123 Main St, New York, NY",
  });

  // Payment method state
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);

  // Handle payment method selection
  const handlePaymentMethod = (method) => {
    if (method === "cash") {
      setShowUserDetailsForm(true); // Show UserDetailsForm
    } else if (method === "card") {
      // Redirect to card payment gateway (not implemented here)
      Swal.fire({
        icon: "info",
        title: "Redirecting to Payment Gateway...",
        text: "This feature is not implemented yet.",
      });
    }
  };

  // Handle form submission
  const handleConfirmOrder = (updatedDetails) => {
    setUserDetails(updatedDetails); // Update user details
    setShowUserDetailsForm(false); // Hide the form
    navigate("/FindDeliveryPerson"); // Navigate to FindDeliveryPerson page
  };

  // Handle form cancellation
  const handleCancelOrder = () => {
    setShowUserDetailsForm(false); // Hide the form
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Payment</h1>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-4"
                  >
                    <div>
                      <p className="text-lg font-bold">{item.name}</p>
                      <p className="text-gray-600">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-lg font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <p className="text-xl font-bold">Total</p>
                <p className="text-xl font-bold">${totalPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>
              <div className="space-y-4">
                {/* Cash on Delivery Button */}
                <button
                  onClick={() => handlePaymentMethod("cash")}
                  className="w-full flex items-center justify-between bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-all"
                >
                  <span className="text-lg">Cash on Delivery</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </button>

                {/* Credit/Debit Card Button */}
                <button
                  onClick={() => handlePaymentMethod("card")}
                  className="w-full flex items-center justify-between bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-all"
                >
                  <span className="text-lg">Credit/Debit Card</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Details Form Modal */}
        {showUserDetailsForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
            <UserDetailsForm
              userDetails={userDetails}
              onConfirm={handleConfirmOrder}
              onCancel={handleCancelOrder}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentPage;