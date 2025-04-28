// src/components/Restaurant/MenuItemForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { foodServiceApi } from "../../../apiClients";
import Layout from "../../components/Layout";
import { FiPlus, FiX, FiSave, FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Halal",
  "Kosher",
];

const categoryOptions = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Salads",
  "Sides",
  "Specials",
];

function MenuItemForm() {
  const { id, menuItemId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    isAvailable: true,
    preparationTime: 15,
    ingredients: [],
    dietaryTags: [],
    image: "",
  });
  const [ingredientInput, setIngredientInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (menuItemId) {
      const fetchMenuItem = async () => {
        try {
          const response = await foodServiceApi.get(
            `/restaurant/menu/${menuItemId}`
          );
          setFormData(response.data);
        } catch (err) {
          setError(err.response?.data?.error || "Failed to fetch menu item");
          showErrorAlert(
            err.response?.data?.error || "Failed to fetch menu item"
          );
        }
      };
      fetchMenuItem();
    }
  }, [menuItemId]);

  const showSuccessAlert = (message) => {
    MySwal.fire({
      title: "Success!",
      text: message,
      icon: "success",
      confirmButtonColor: "#10b981",
      customClass: {
        container: "font-sans",
      },
    });
  };

  const showErrorAlert = (message) => {
    MySwal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonColor: "#ef4444",
      customClass: {
        container: "font-sans",
      },
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddIngredient = () => {
    if (!ingredientInput.trim()) {
      showErrorAlert("Please enter an ingredient");
      return;
    }

    if (formData.ingredients.includes(ingredientInput.trim())) {
      showErrorAlert("This ingredient already exists");
      return;
    }

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredientInput.trim()],
    });
    setIngredientInput("");
  };

  const handleRemoveIngredient = (ingredient) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((item) => item !== ingredient),
    });
  };

  const handleDietaryTagChange = (tag) => {
    setFormData({
      ...formData,
      dietaryTags: formData.dietaryTags.includes(tag)
        ? formData.dietaryTags.filter((t) => t !== tag)
        : [...formData.dietaryTags, tag],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (menuItemId) {
        await foodServiceApi.put(`/restaurant/menu/${menuItemId}`, formData);
        showSuccessAlert("Menu item updated successfully!");
      } else {
        await foodServiceApi.post(`/restaurant/${id}/menu`, formData);
        showSuccessAlert("Menu item created successfully!");
      }
      navigate(`/restaurant/${id}/menu`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save menu item");
      showErrorAlert(err.response?.data?.error || "Failed to save menu item");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      formData.name ||
      formData.description ||
      formData.ingredients.length > 0
    ) {
      MySwal.fire({
        title: "Are you sure?",
        text: "You have unsaved changes that will be lost.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, discard changes",
        cancelButtonText: "No, keep editing",
        customClass: {
          container: "font-sans",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/restaurant/${id}/menu`);
        }
      });
    } else {
      navigate(`/restaurant/${id}/menu`);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
            <h2 className="text-2xl font-bold text-white">
              {menuItemId ? "Edit Menu Item" : "Create New Menu Item"}
            </h2>
            <p className="text-emerald-100">
              {menuItemId
                ? "Update your menu item details"
                : "Add a new item to your menu"}
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="name"
                >
                  Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows="3"
                  placeholder="Describe your menu item..."
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="price"
                  >
                    Price*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="category"
                  >
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preparation Time */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="preparationTime"
                >
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  id="preparationTime"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ingredients
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddIngredient()
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add ingredient (press Enter or click Add)"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-r-lg hover:bg-emerald-600 flex items-center"
                  >
                    <FiPlus className="mr-1" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.map((ingredient) => (
                    <div
                      key={ingredient}
                      className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center"
                    >
                      {ingredient}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ingredient)}
                        className="ml-2 text-emerald-600 hover:text-emerald-800"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Dietary Tags
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dietaryOptions.map((tag) => (
                    <label key={tag} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.dietaryTags.includes(tag)}
                        onChange={() => handleDietaryTagChange(tag)}
                        className="h-5 w-5 text-emerald-500 rounded focus:ring-emerald-500 border-gray-300"
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="image"
                >
                  Image URL
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-500 rounded focus:ring-emerald-500 border-gray-300"
                />
                <label htmlFor="isAvailable" className="ml-2 text-gray-700">
                  Currently Available
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <FiArrowLeft className="mr-2" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300 flex items-center"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <FiSave className="mr-2" />{" "}
                      {menuItemId ? "Update" : "Save"} Menu Item
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default MenuItemForm;
