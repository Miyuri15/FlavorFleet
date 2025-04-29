import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const GATEWAY_BACKEND_URL = import.meta.env.VITE_GATEWAY_BACKEND_URL;

function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
      adminName: "",
      organization: "",
      preferredRoute: "",
      restaurantName: "",
    },
    validationSchema: Yup.lazy((values) =>
      Yup.object({
        firstName: Yup.string().required("First Name is required"),
        lastName: Yup.string().required("Last Name is required"),
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        address: Yup.string().required("address is required"),
        contactNumber: Yup.string()
          .matches(/^\d{10}$/, "Must be 10 digits")
          .required("Contact Number is required"),
        password: Yup.string()
          .min(6, "Min 6 characters")
          .required("Password is required"),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("password")], "Passwords must match")
          .required("Confirm your password"),
        ...(role === "admin" && {
          adminName: Yup.string().required("Admin name is required"),
          organization: Yup.string().required("Organization is required"),
        }),
        ...(role === "delivery" && {
          preferredRoute: Yup.string().required("Preferred route is required"),
        }),
        ...(role === "restaurant_owner" && {
          restaurantName: Yup.string().required("Restaurant name is required"),
        }),
      })
    ),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const dataToSend = { ...values, role };
        const response = await fetch(
          `${GATEWAY_BACKEND_URL}/api/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!response.ok)
          throw new Error(result.message || "Registration failed");

        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "Redirecting to login...",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/login"));
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
    },
  });

  return (
    <div className="register-form flex flex-col md:flex-row h-screen">
      {/* Left Panel */}
      <div
        className="relative hidden min-h-screen h-full md:flex md:w-3/5 bg-cover bg-center"
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
          <h1 className="text-3xl font-bold mb-5">Register</h1>
          <h2 className="text-4xl font-extrabold mb-3">FLAVORFLEET</h2>
          <p className="text-md leading-relaxed mb-9">
            Welcome to FlavorFleet, where ordering your meals is just a click
            away.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="justify-center h-screen overflow-y-auto md:w-2/5 p-8 bg-blue-100">
        <div className="flex flex-col items-center mb-4">
          <p className="text-blue-900 text-center text-md font-semibold">
            Create your free account to order meals, track deliveries, and pay
            online.
          </p>
        </div>

        <div className="flex flex-col justify-center mt-6">
          {/* Role Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["user", "admin", "delivery", "restaurant_owner"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 min-w-[120px] border-2 rounded-lg py-2 ${
                  role === r
                    ? "bg-blue-900 text-white"
                    : "bg-gray-50 text-blue-900"
                }`}
              >
                {r === "user" && "User"}
                {r === "admin" && "Admin"}
                {r === "delivery" && "Delivery"}
                {r === "restaurant_owner" && "Restaurant Owner"}
              </button>
            ))}
          </div>

          <h2 className="text-medium text-center text-blue-900 font-bold mb-4">
            Join FlavorFleet and Get Started!
          </h2>

          <form
            className="space-y-4 text-blue-900"
            onSubmit={formik.handleSubmit}
          >
            {role === "admin" && (
              <>
                <input
                  name="adminName"
                  placeholder="Admin Name"
                  className="input"
                  {...formik.getFieldProps("adminName")}
                />
                {formik.touched.adminName && formik.errors.adminName && (
                  <p className="text-red-500">{formik.errors.adminName}</p>
                )}
                <input
                  name="organization"
                  placeholder="Organization"
                  className="input"
                  {...formik.getFieldProps("organization")}
                />
                {formik.touched.organization && formik.errors.organization && (
                  <p className="text-red-500">{formik.errors.organization}</p>
                )}
              </>
            )}

            {role === "restaurant_owner" && (
              <>
                <input
                  name="restaurantName"
                  placeholder="Restaurant Name"
                  className="input"
                  {...formik.getFieldProps("restaurantName")}
                />
                {formik.touched.restaurantName &&
                  formik.errors.restaurantName && (
                    <p className="text-red-500">
                      {formik.errors.restaurantName}
                    </p>
                  )}
              </>
            )}

            <input
              name="firstName"
              placeholder="First Name"
              className="input"
              {...formik.getFieldProps("firstName")}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-red-500">{formik.errors.firstName}</p>
            )}

            <input
              name="lastName"
              placeholder="Last Name"
              className="input"
              {...formik.getFieldProps("lastName")}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-red-500">{formik.errors.lastName}</p>
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="input"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500">{formik.errors.email}</p>
            )}

            <input
              name="address"
              type="text"
              placeholder="Address"
              className="input"
              {...formik.getFieldProps("address")}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500">{formik.errors.address}</p>
            )}

            <input
              name="contactNumber"
              placeholder="Contact Number"
              className="input"
              {...formik.getFieldProps("contactNumber")}
            />
            {formik.touched.contactNumber && formik.errors.contactNumber && (
              <p className="text-red-500">{formik.errors.contactNumber}</p>
            )}

            {role === "delivery" && (
              <>
                <select
                  name="preferredRoute"
                  className="input"
                  {...formik.getFieldProps("preferredRoute")}
                >
                  <option value="">Select Preferred Route</option>
                  {[
                    "Colombo",
                    "Kelaniya",
                    "Gampaha",
                    "Kalutara",
                    "Kandy",
                    "Matale",
                    "Nuwara Eliya",
                    "Galle",
                    "Matara",
                    "Hambantota",
                    "Jaffna",
                  ].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {formik.touched.preferredRoute &&
                  formik.errors.preferredRoute && (
                    <p className="text-red-500">
                      {formik.errors.preferredRoute}
                    </p>
                  )}
              </>
            )}

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input w-full"
                {...formik.getFieldProps("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500">{formik.errors.password}</p>
            )}

            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="input w-full"
                {...formik.getFieldProps("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-red-500">{formik.errors.confirmPassword}</p>
              )}

            <Button type="submit" disabled={isLoading || !formik.isValid}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="text-md font-medium text-center mt-4 text-black dark:text-blue-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-900 font-bold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
