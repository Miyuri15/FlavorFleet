import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { foodServiceApi } from "../../../apiClients";
import ROUTES from "../../routes";
import Layout from "../../components/Layout";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCoffee,
  FiAlertTriangle,
} from "react-icons/fi";
import Loading from "../../components/Loading/Loading";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, menuRes] = await Promise.all([
          foodServiceApi.get(`/restaurant/${id}`),
          foodServiceApi.get(`/restaurant/${id}/menu`),
        ]);
        setRestaurant(restaurantRes.data);
        setMenuItems(menuRes.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch restaurant data"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async (itemId) => {
    try {
      const result = await MySwal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        customClass: {
          container: "font-sans",
        },
      });

      if (result.isConfirmed) {
        await foodServiceApi.delete(`/restaurant/menu/${itemId}`);
        setMenuItems(menuItems.filter((item) => item._id !== itemId));

        MySwal.fire({
          title: "Deleted!",
          text: "Your menu item has been deleted.",
          icon: "success",
          confirmButtonColor: "#10b981", // emerald-500
          customClass: {
            container: "font-sans",
          },
        });
      }
    } catch (err) {
      MySwal.fire({
        title: "Error!",
        text: err.response?.data?.error || "Failed to delete menu item",
        icon: "error",
        confirmButtonColor: "#ef4444", // red-500
        customClass: {
          container: "font-sans",
        },
      });
    }
  };

  if (loading) return <Loading />;

  if (error)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 max-w-2xl mx-auto"
            role="alert"
          >
            <div className="flex items-center justify-center">
              <FiAlertTriangle className="mr-2 text-xl" />
              <p className="font-bold">Error Loading Menu</p>
            </div>
            <p className="mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );

  if (!restaurant)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 max-w-2xl mx-auto">
            <p className="font-medium">Restaurant not found</p>
            <Link
              to={ROUTES.RESTAURANT_MANAGEMENT}
              className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Restaurants
            </Link>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 font-sans">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {restaurant.name}
            </h1>
            <p className="text-gray-600 mt-1">Manage your menu items</p>
          </div>
          <Link
            to={`${ROUTES.RESTAURANT_DETAILS(id)}/menu/add`}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
          >
            <FiPlus />
            Add Menu Item
          </Link>
        </div>

        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
            <FiCoffee className="mx-auto text-5xl text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Menu Items Yet
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't added any items to your menu yet. Start by adding your
              first item.
            </p>
            <Link
              to={`${ROUTES.RESTAURANT_DETAILS(id)}/menu/add`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <FiPlus />
              Add First Menu Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                {/* Item Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiCoffee className="text-4xl text-gray-400" />
                  )}
                </div>

                {/* Item Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-gray-800 line-clamp-1">
                      {item.name}
                    </h2>
                    <span className="text-lg font-bold text-emerald-600">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description || "No description provided"}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">
                      {item.category || "Uncategorized"}
                    </span>
                    {item.dietaryTags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center border-t pt-4">
                    <Link
                      to={`${ROUTES.RESTAURANT_DETAILS(id)}/menu/edit/${
                        item._id
                      }`}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                    >
                      <FiEdit2 />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RestaurantMenu;
