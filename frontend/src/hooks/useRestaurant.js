import { useState, useEffect, useCallback } from "react";
import { restaurantService, handleApiError } from "../services/api";

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getRestaurants();
      setRestaurants(response.data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch restaurants"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
  };
};

export const useRestaurant = (restaurantId) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant(restaurantId);
      fetchMenu(restaurantId);
    }
  }, [restaurantId]);

  const fetchRestaurant = async (id) => {
    try {
      const response = await restaurantService.getRestaurant(id);
      setRestaurant(response.data);
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch restaurant"));
    }
  };

  const fetchMenu = async (id) => {
    try {
      setLoading(true);
      const response = await restaurantService.getMenu(id);
      setMenu(response.data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch menu"));
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (itemData) => {
    try {
      const response = await restaurantService.addMenuItem(
        restaurantId,
        itemData
      );
      setMenu((prev) => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to add menu item");
      return { success: false, error: errorMessage };
    }
  };

  const updateMenuItem = async (itemId, itemData) => {
    try {
      const response = await restaurantService.updateMenuItem(
        restaurantId,
        itemId,
        itemData
      );
      setMenu((prev) =>
        prev.map((item) => (item._id === itemId ? response.data : item))
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to update menu item");
      return { success: false, error: errorMessage };
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      await restaurantService.deleteMenuItem(restaurantId, itemId);
      setMenu((prev) => prev.filter((item) => item._id !== itemId));
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to delete menu item");
      return { success: false, error: errorMessage };
    }
  };

  return {
    restaurant,
    menu,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: () => {
      fetchRestaurant(restaurantId);
      fetchMenu(restaurantId);
    },
  };
};
