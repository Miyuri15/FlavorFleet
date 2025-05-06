import React from "react";

const InputField = ({
  label,
  id,
  name,
  type = "text",
  formik,
  className = "",
}) => {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-light dark:text-text-dark mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
        className={`w-full p-2 border rounded bg-white dark:bg-primary-dark text-text-light dark:text-text-dark border-secondary-light dark:border-accent-dark focus:ring-2 focus:ring-button-light dark:focus:ring-accent-dark focus:border-transparent ${
          hasError ? "border-red-500 dark:border-red-400" : ""
        }`}
      />
      {hasError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {formik.errors[name]}
        </p>
      )}
    </div>
  );
};

export default InputField;
