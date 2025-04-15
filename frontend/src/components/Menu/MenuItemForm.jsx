import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const MenuItemForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEditing,
}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string(),
    price: Yup.number()
      .min(0, "Price must be positive")
      .required("Price is required"),
    category: Yup.string().required("Category is required"),
    isAvailable: Yup.boolean(),
    preparationTime: Yup.number().min(0, "Preparation time must be positive"),
    ingredients: Yup.array().of(Yup.string()),
    dietaryTags: Yup.array().of(Yup.string()),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: "",
      description: "",
      price: 0,
      category: "",
      isAvailable: true,
      preparationTime: 15,
      ingredients: [],
      dietaryTags: [],
      image: "",
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const [newIngredient, setNewIngredient] = React.useState("");

  const handleAddIngredient = () => {
    if (
      newIngredient.trim() &&
      !formik.values.ingredients.includes(newIngredient.trim())
    ) {
      formik.setFieldValue("ingredients", [
        ...formik.values.ingredients,
        newIngredient.trim(),
      ]);
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    formik.setFieldValue(
      "ingredients",
      formik.values.ingredients.filter((i) => i !== ingredient)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

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
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...formik.getFieldProps("category")}
                />
                {formik.touched.category && formik.errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (LKR)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...formik.getFieldProps("price")}
                />
                {formik.touched.price && formik.errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preparation Time (min)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  {...formik.getFieldProps("preparationTime")}
                />
                {formik.touched.preparationTime &&
                  formik.errors.preparationTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.preparationTime}
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dietary Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="dietaryTags"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formik.values.dietaryTags?.join(", ") || ""}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "dietaryTags",
                      e.target.value.split(",").map((tag) => tag.trim())
                    )
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                {...formik.getFieldProps("description")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ingredients
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add ingredient"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formik.values.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
                    >
                      <span className="sr-only">Remove</span>
                      <svg
                        className="h-2 w-2"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 8 8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.5"
                          d="M1 1l6 6m0-6L1 7"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                id="isAvailable"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formik.values.isAvailable}
                onChange={formik.handleChange}
              />
              <label
                htmlFor="isAvailable"
                className="ml-2 block text-sm text-gray-700"
              >
                Available
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditing ? "Update Item" : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;
