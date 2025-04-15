import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import MenuList from "../../components/Menu/MenuList";
import { foodServiceApi } from "../../../apiClients";

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get restaurant details first
        const restaurantRes = await foodServiceApi.get("/restaurants/");
        setRestaurant(restaurantRes.data);

        // Then get menu items for this restaurant
        const menuRes = await foodServiceApi.get(
          `/restaurants/${restaurantRes.data._id}/menu`
        );
        setMenuItems(menuRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/restaurant-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleUpdateItem = async (itemData) => {
    try {
      if (itemData._id) {
        // Update existing item
        const response = await foodServiceApi.put(
          `/menu/${itemData._id}`,
          itemData
        );
        setMenuItems(
          menuItems.map((item) =>
            item._id === itemData._id ? response.data : item
          )
        );
      } else {
        // Create new item
        const response = await foodServiceApi.post("/menu", {
          ...itemData,
          restaurant: restaurant._id,
        });
        setMenuItems([...menuItems, response.data]);
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await foodServiceApi.delete(`/menu/${itemId}`);
      setMenuItems(menuItems.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  if (loading || !restaurant) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Menu Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the menu for {restaurant.name}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <MenuList
            items={menuItems}
            onEdit={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        </div>
      </div>
    </Layout>
  );
};

export default MenuManagement;
