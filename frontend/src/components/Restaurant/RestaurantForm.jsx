import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const RestaurantForm = ({ initialValues, onSubmit, isEditing }) => {
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string(),
    cuisineType: Yup.string().required("Cuisine type is required"),
    contactNumber: Yup.string().required("Contact number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    address: Yup.object().shape({
      street: Yup.string().required("Street is required"),
      city: Yup.string().required("City is required"),
      postalCode: Yup.string().required("Postal code is required"),
    }),
    openingHours: Yup.object().shape({
      monday: Yup.object().shape({
        open: Yup.string(),
        close: Yup.string(),
      }),
      // Add other days similarly
    }),
    deliveryRadius: Yup.number().min(1, "Delivery radius must be at least 1km"),
    isAvailable: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: "",
      description: "",
      cuisineType: "",
      contactNumber: "",
      email: "",
      address: {
        street: "",
        city: "",
        postalCode: "",
        coordinates: { lat: 0, lng: 0 },
      },
      openingHours: {
        monday: { open: "", close: "" },
        tuesday: { open: "", close: "" },
        wednesday: { open: "", close: "" },
        thursday: { open: "", close: "" },
        friday: { open: "", close: "" },
        saturday: { open: "", close: "" },
        sunday: { open: "", close: "" },
      },
      deliveryRadius: 5,
      isAvailable: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await onSubmit(values);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("name")}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cuisine Type
          </label>
          <input
            type="text"
            name="cuisineType"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("cuisineType")}
          />
          {formik.touched.cuisineType && formik.errors.cuisineType && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.cuisineType}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <input
            type="text"
            name="contactNumber"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("contactNumber")}
          />
          {formik.touched.contactNumber && formik.errors.contactNumber && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.contactNumber}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <input
            type="text"
            name="address.street"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("address.street")}
          />
          {formik.touched.address?.street && formik.errors.address?.street && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.address.street}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            name="address.city"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("address.city")}
          />
          {formik.touched.address?.city && formik.errors.address?.city && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.address.city}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            type="text"
            name="address.postalCode"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("address.postalCode")}
          />
          {formik.touched.address?.postalCode &&
            formik.errors.address?.postalCode && (
              <p className="mt-1 text-sm text-red-600">
                {formik.errors.address.postalCode}
              </p>
            )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delivery Radius (km)
          </label>
          <input
            type="number"
            name="deliveryRadius"
            min="1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            {...formik.getFieldProps("deliveryRadius")}
          />
          {formik.touched.deliveryRadius && formik.errors.deliveryRadius && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.deliveryRadius}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Opening Hours
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(formik.values.openingHours).map(([day, hours]) => (
            <div key={day} className="border rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-700 capitalize">
                {day}
              </h4>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">Open</label>
                  <input
                    type="time"
                    name={`openingHours.${day}.open`}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    {...formik.getFieldProps(`openingHours.${day}.open`)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Close</label>
                  <input
                    type="time"
                    name={`openingHours.${day}.close`}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    {...formik.getFieldProps(`openingHours.${day}.close`)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading || !formik.isValid}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
            ? "Update Restaurant"
            : "Create Restaurant"}
        </button>
      </div>
      <div className="col-span-full">
        <Switch.Group as="div" className="flex items-center">
          <Switch
            checked={formik.values.isAvailable}
            onChange={(value) => formik.setFieldValue("isAvailable", value)}
            className={`${
              formik.values.isAvailable ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span
              className={`${
                formik.values.isAvailable ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
          <Switch.Label as="span" className="ml-3 text-sm">
            <span className="font-medium text-gray-900">
              Restaurant is {formik.values.isAvailable ? "Open" : "Closed"}
            </span>
          </Switch.Label>
        </Switch.Group>
      </div>
    </form>
  );
};

export default RestaurantForm;
