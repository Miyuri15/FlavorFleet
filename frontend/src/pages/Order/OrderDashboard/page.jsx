// src/pages/Order/page.jsx
import React, { useState, useEffect } from 'react';
import Error from '../../../components/Error/Error';
import Loading from '../../../components/Loading/Loading';

const OrderDashboard = () => {
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from all APIs concurrently
        const [orderResponse, paymentResponse, deliveryResponse, restaurantResponse] = await Promise.all([
          fetch('http://localhost:5000/api/order').then((res) => res.json()),
         fetch('http://localhost:5002/api/payment').then((res) => res.json()),
          fetch('http://localhost:5001/api/delivery').then((res) => res.json()),
          fetch('http://localhost:5003/api/restaurant').then((res) => res.json()),
        ]);
        // Set the fetched data
       setOrderData(orderResponse);
       setPaymentData(paymentResponse);
        setDeliveryData(deliveryResponse);
       setRestaurantData(restaurantResponse);
      } catch (err) {
        setError(err); // Handle errors
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />; // Show loading spinner
  }

  if (error) {
    return <Error error={error} />; // Show error message
  }

  return (
    <div className="flex-1 p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-900">Order Dashboard</h1>
      <p className="mt-2 text-gray-700">Welcome to the Order Dashboard!</p>

      {/* Display fetched data */}
      <div className="mt-4 space-y-4">
         <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold text-blue-800">Order Data</h2>
          <pre className="mt-2 text-gray-700">{JSON.stringify(orderData, null, 2)}</pre>
        </div> 

         <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold text-blue-800">Payment Data</h2>
          <pre className="mt-2 text-gray-700">{JSON.stringify(paymentData, null, 2)}</pre>
        </div> 

        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold text-blue-800">Delivery Data</h2>
          <pre className="mt-2 text-gray-700">{JSON.stringify(deliveryData, null, 2)}</pre>
        </div>

         <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold text-blue-800">Restaurant Data</h2>
          <pre className="mt-2 text-gray-700">{JSON.stringify(restaurantData, null, 2)}</pre>
        </div> 
      </div>
    </div>
  );
};

export default OrderDashboard;