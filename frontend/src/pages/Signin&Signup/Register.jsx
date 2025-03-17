import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "./Button";

function Register() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false); // Changed from isRecruiter to isAdmin
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.confirmPassword = data.password;
    console.log("Data being sent to backend:", data); // Debugging

    try {
        const response = await fetch("http://localhost:5004/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, role: isAdmin ? "admin" : "user" }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Registration failed");
        }

        Swal.fire({
            icon: "success",
            title: "Registration Successful!",
            text: "Redirecting to login...",
            timer: 5000,
            showConfirmButton: false,
        }).then(() => {
            navigate("/login");
        });
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: error.message,
            timer: 5000,
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
        style={{ backgroundImage: "url('/img/logincover.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-70"></div>
        <div className="absolute top-9 left-9 cursor-pointer w-90 h-90">
          <img src="/img/FintrackLogo.png" alt="Logo" className="w-80 h-34 mx-5" />
        </div>
        <div className="flex flex-col items-start justify-end p-10 bg-blue-900 bg-opacity-30 text-white h-full w-full">
          <h1 className="text-3xl font-bold mb-5">Register</h1>
          <h2 className="text-4xl font-extrabold mb-3">FINTRACK</h2>
          <p className="text-md leading-relaxed mb-9">
            Welcome to FinTrack, where managing your finances and tracking your
            expenses is just a click away.
          </p>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="flex flex-col justify-center md:w-2/5 p-8 bg-blue-200">
        <div className="flex flex-col items-center">
          
          <p className="text-blue-900  text-center text-md font-semibold">
            Create your free account to manage your finances, track expenses, and
            take control of your financial journey.
          </p>
        </div>

        <div className="flex flex-col justify-center mt-6">
          {/* User / Admin Selection */}
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAdmin(false)}
              className={`w-full border-2 border-gray-300 rounded-lg py-2 ${
                !isAdmin ? "bg-blue-900 text-white" : "bg-gray-50 text-blue-900"
              }`}
            >
              <span className="flex items-center justify-center">
                User
              </span>
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`w-full border-2 border-gray-300 rounded-lg ${
                isAdmin ? "bg-blue-900 text-white" : "bg-gray-50 text-blue-900"
              }`}
            >
              <span className="flex items-center justify-center">
                Admin
              </span>
            </button>
          </div>

          <h2 className="text-medium text-center text-blue-900  font-bold my-3">
            Join FinTrack and Take Control of Your Finances!
          </h2>

          {/* Conditional Form Rendering */}
          <form className="space-y-4 text-blue-900" onSubmit={handleRegister}>
            {isAdmin ? (
              <>
                <input
                  type="text"
                  name="adminName"
                  placeholder="Admin Name"
                  className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
                />
                <input
                  type="text"
                  name="organization"
                  placeholder="Organization"
                  className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
                />
              </>
            ) : null}
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
            />
            <input
              type="text"
              name="contactNumber"
              placeholder="Contact Number"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-900 font-medium"
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