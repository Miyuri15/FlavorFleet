import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "./Button";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Formik config
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email Field Required"),
      password: Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password Field Required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5004/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Login failed");
        }

        const decodedToken = jwtDecode(result.token);
        console.log("Decoded token:", decodedToken);

        // Store token in local storage
        localStorage.setItem("token", result.token);

        const user = {
          token: result.token,
          username: decodedToken.username,
          role: decodedToken.role,
        };

        // Set user in AuthContext
        login(user);

        // Redirect based on role
        if (decodedToken.role === "admin") {
          navigate("/admindashboard");
        } else if (decodedToken.role === "delivery") {
          navigate("/deliverydashboard");
        }else {
          navigate("/userdashboard");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.message,
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Panel */}
      <div
        className="relative hidden h-full md:flex md:w-3/5 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/flavorfleetcover.jpg')" }}
      >
        <div className="absolute top-9 left-9 cursor-pointer w-90 h-90">
          <img
            src="/img/flavorfleetlogo.png"
            alt="Logo"
            className="w-40 h-34 mx-5"
          />
        </div>
        <div className="flex flex-col items-start justify-end p-10 text-white h-full w-full">
          <h1 className="text-3xl font-bold mb-5">Login</h1>
          <h2 className="text-4xl font-extrabold mb-3">FLAVORFLEET</h2>
          <p className="text-md leading-relaxed mb-9">
            Welcome to FlavorFleet, where finding your dream meals is just a
            click away.
          </p>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex flex-col min-h-screen justify-center md:w-2/5 p-8 bg-blue-100">
        <div className="flex flex-col items-center mb-4">
          <img
            src="/img/flavorfleetlogo.png"
            alt="logo"
            width={200}
            height={40}
            className="center"
          />
          <h2 className="text-xl text-blue-900 font-semibold text-center mb-2">
            Welcome Back! Let's Get You Started.
          </h2>
          <p className="text-blue-900 text-center text-md mt-4 mb-4 font-medium">
            Log in to access your account and continue your ordering meals
          </p>
        </div>

        <form
          className="space-y-4 text-blue-900"
          onSubmit={formik.handleSubmit}
        >
          <label className="block">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-3 py-2 border rounded-lg mt-1 bg-blue-200 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-semibold"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="text-red-500 text-sm font-medium mt-1">
                {formik.errors.email}
              </p>
            ) : null}
          </label>

          <label className="block relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full px-3 py-2 border rounded-lg mt-1 bg-blue-200 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 font-semibold"
              {...formik.getFieldProps("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center justify-items-center text-sm leading-5"
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </button>
            {formik.touched.password && formik.errors.password ? (
              <p className="text-red-500 text-sm font-medium mt-1">
                {formik.errors.password}
              </p>
            ) : null}
          </label>

          <Button type="submit" disabled={isLoading || !formik.isValid}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-md font-medium text-center mt-2 text-black dark:text-blue-600">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-900 font-bold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
