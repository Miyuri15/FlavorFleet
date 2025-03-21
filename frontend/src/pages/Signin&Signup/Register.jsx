import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Swal from "sweetalert2";

function Register() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false); // Changed from isRecruiter to isAdmin
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("user");

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
  
    // Add confirmPassword to the data object
    data.confirmPassword = data.password;
  
    console.log("Data being sent to backend:", data); // Debugging
  
    try {
      const response = await fetch("http://localhost:5004/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role }), // Include the selected role
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }
  
      // Registration successful
      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Redirecting to login...",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login"); // Navigate to login page
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Side with Image and Intro Text */}
      <div
        className="relative hidden h-full md:flex md:w-3/5 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/flavorfleetcover.jpg')" }}
      >
        <div className="absolute inset-0  opacity-10"></div>
        <div className="absolute top-9 left-9 cursor-pointer w-90 h-90">
          <img
            src="/img/flavorfleetlogo.png"
            alt="Logo"
            className="w-40 h-34 mx-5"
          />
        </div>
        <div className="flex flex-col items-start justify-end p-10 bg-gray-900 bg-opacity-30 text-white h-full w-full">
          <h1 className="text-3xl font-bold mb-5">Register</h1>
          <h2 className="text-4xl font-extrabold mb-3">FLAVORFLEET</h2>
          <p className="text-md leading-relaxed mb-9">
            Welcome to FlavorFleet, where Order your meals to door step is just a click away.
          </p>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="flex flex-col justify-center md:w-2/5 p-8 bg-blue-100">
        <div className="flex flex-col items-center">
          <p className="text-blue-900  text-center text-md font-semibold">
            Create your free account to Order your Meals, track orders,
            and make  your Payment online.
          </p>
        </div>

        <div className="flex flex-col justify-center mt-6">
          {/* User / Admin Selection */}
          <div className="flex space-x-4">
            <button
              onClick={() => setRole("user")}
              className={`w-full border-2 border-gray-300 rounded-lg py-2 ${
                role === "user"
                  ? "bg-blue-900 text-white"
                  : "bg-gray-50 text-blue-900"
              }`}
            >
              <span className="flex items-center justify-center">User</span>
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`w-full border-2 border-gray-300 rounded-lg py-2 ${
                role === "admin"
                  ? "bg-blue-900 text-white"
                  : "bg-gray-50 text-blue-900"
              }`}
            >
              <span className="flex items-center justify-center">Admin</span>
            </button>
            <button
              onClick={() => setRole("delivery")}
              className={`w-full border-2 border-gray-300 rounded-lg py-2 ${
                role === "delivery"
                  ? "bg-blue-900 text-white"
                  : "bg-gray-50 text-blue-900"
              }`}
            >
              <span className="flex items-center justify-center">
                Delivery Person
              </span>
            </button>
          </div>
          <h2 className="text-medium text-center text-blue-900  font-bold my-3">
            Join FlavorFleet and Take Your meals fast!
          </h2>
          {/* Conditional Form Rendering */}
          <form className="space-y-4 text-blue-900" onSubmit={handleRegister}>
            {role === "admin" ? (
              <>
                <input
                  type="text"
                  name="adminName"
                  placeholder="Admin Name"
                  className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
                />
                <input
                  type="text"
                  name="organization"
                  placeholder="Organization"
                  className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
                />
              </>
            ) : null}
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
            />
            <input
              type="text"
              name="contactNumber"
              placeholder="Contact Number"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
            />
            {role === "delivery" && (
              <select
                name="preferredRoute"
                className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
              >
                <option value="">Select Preferred Route</option>
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Kandy">Kandy</option>
                <option value="Matale">Matale</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Galle">Galle</option>
                <option value="Matara">Matara</option>
                <option value="Hambantota">Hambantota</option>
                <option value="Jaffna">Jaffna</option>
              </select>
            )}
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 bg-blue-200 placeholder-gray-500 font-medium"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-md font-medium text-center mt-2 text-black dark:text-blue-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-900  font-bold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
