// src/components/Restaurant/MenuItemForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { foodServiceApi } from "../../../apiClients";
import Layout from "../../components/Layout";

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
        }
      };
      fetchMenuItem();
    }
  }, [menuItemId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddIngredient = () => {
    if (
      ingredientInput.trim() &&
      !formData.ingredients.includes(ingredientInput)
    ) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()],
      });
      setIngredientInput("");
    }
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
      } else {
        await foodServiceApi.post(`/restaurant/${id}/menu`, formData);
      }
      navigate(`/restaurant/${id}/menu`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save menu item");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">
          {menuItemId ? "Edit Menu Item" : "Add New Menu Item"}
        </h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="price">
              Price*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="category">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
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

          <div className="mb-4">
            <label
              className="block text-gray-700 mb-2"
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
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ingredients</label>
            <div className="flex mb-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-l"
                placeholder="Add ingredient"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.ingredients.map((ingredient) => (
                <div
                  key={ingredient}
                  className="bg-gray-200 px-3 py-1 rounded-full flex items-center"
                >
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ingredient)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Dietary Tags</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dietaryOptions.map((tag) => (
                <label key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dietaryTags.includes(tag)}
                    onChange={() => handleDietaryTagChange(tag)}
                    className="mr-2"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="image">
              Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isAvailable">Available</label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/restaurant/${id}/menu`)}
              className="mr-4 px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {loading ? "Saving..." : "Save Menu Item"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default MenuItemForm;
