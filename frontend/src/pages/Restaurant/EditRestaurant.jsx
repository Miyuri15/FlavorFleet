import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import RestaurantForm from "../../components/Restaurant/RestaurantForm";
import { foodServiceApi } from "../../../apiClients";

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await foodServiceApi.get(`/restaurants/${id}`);
        setRestaurant(response.data);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        navigate("/restaurant-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  const handleSubmit = async (values) => {
    try {
      await foodServiceApi.put(`/restaurants/${id}`, values);
      navigate("/restaurant-dashboard");
    } catch (error) {
      console.error("Error updating restaurant:", error);
    }
  };

  if (loading) {
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
            Edit Restaurant
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <RestaurantForm
            initialValues={restaurant}
            onSubmit={handleSubmit}
            isEditing={true}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditRestaurant;
