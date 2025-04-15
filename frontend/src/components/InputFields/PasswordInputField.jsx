import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Using react-icons library

const PasswordInputField = ({ label, id, name, formik, className = "" }) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = formik.touched[name] && formik.errors[name];

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          className={`w-full p-2 pr-10 border rounded bg-white dark:bg-primary-dark text-text-light dark:text-text-dark border-secondary-light dark:border-accent-dark focus:ring-2 focus:ring-button-light dark:focus:ring-accent-dark focus:border-transparent ${
            hasError ? "border-red-500 dark:border-red-400" : ""
          }`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {formik.errors[name]}
        </p>
      )}
    </div>
  );
};

export default PasswordInputField;
