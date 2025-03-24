import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Swal from 'sweetalert2';

const OrderPage = () => {
  // Dummy data for food items
  const foodItems = [
    {
      id: 1,
      name: 'Cheeseburger',
      category: 'Burgers',
      price: 650.0,
      restaurant: 'Burger King',
      location: 'Colombo',
      image: '/img/Cheeseburger.jpeg',
      availability: 'In Stock',
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      category: 'Pizza',
      price: 1299.0,
      restaurant: 'Pizza Hut',
      location: 'Kandy',
      image: '/img/PepperoniPizza.jpg',
      availability: 'In Stock',
    },
    {
      id: 3,
      name: 'Chicken Wings',
      category: 'Snacks',
      price: 1400.0,
      restaurant: 'KFC',
      location: 'Galle',
      image: '/img/ChickenWings.jpg',
      availability: 'Out of Stock',
    },
    {
      id: 4,
      name: 'Veggie Wrap',
      category: 'Wraps',
      price: 600.0,
      restaurant: 'Subway',
      location: 'Negombo',
      image: '/img/VeggieWrap.jpeg',
      availability: 'In Stock',
    },
    {
      id: 5,
      name: 'Chicken Kottu',
      category: 'Kottu',
      price: 2300.0,
      restaurant: 'Kottu Labs',
      location: 'Colombo',
      image: '/img/ChickenKottu.jpeg',
      availability: 'In Stock',
    },
    {
      id: 6,
      name: 'Chocolate Lava Cake',
      category: 'Desserts',
      price: 720.0,
      restaurant: 'Dessert House',
      location: 'Kandy',
      image: '/img/ChocolateLavaCake.jpeg',
      availability: 'In Stock',
    },
  ];

  // State for filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [cart, setCart] = useState([]);

  // Unique categories and restaurants for filters
  const categories = [...new Set(foodItems.map((item) => item.category))];
  const restaurants = [...new Set(foodItems.map((item) => item.restaurant))];

  // Filter food items based on selected categories and restaurants
  const filteredItems = foodItems.filter((item) => {
    const categoryMatch =
      selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const restaurantMatch =
      selectedRestaurants.length === 0 || selectedRestaurants.includes(item.restaurant);
    return categoryMatch && restaurantMatch;
  });

  // Add item to cart with quantity input
  const addToCart = (item) => {
    if (item.availability === 'In Stock') {
      Swal.fire({
        title: 'Enter Quantity',
        input: 'number',
        inputLabel: `How many ${item.name}(s) would you like to add?`,
        inputPlaceholder: 'Enter quantity...',
        inputAttributes: {
          min: 1, // Minimum quantity is 1
          step: 1, // Only whole numbers allowed
        },
        showCancelButton: true,
        confirmButtonText: 'Add to Cart',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value || value < 1) {
            return 'Please enter a valid quantity!';
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const quantity = parseInt(result.value, 10);
          const itemWithQuantity = { ...item, quantity }; // Add quantity to the item
          setCart([...cart, itemWithQuantity]); // Add item to cart
          Swal.fire({
            title: 'Added to Cart!',
            text: `${quantity} ${item.name}(s) have been added to your cart.`,
            icon: 'success',
            timer: 1500, // 1.5 seconds
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Out of Stock!',
        text: `${item.name} is currently out of stock.`,
        icon: 'error',
        timer: 1500, // 1.5 seconds
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className='flex flex-grow justify-between items-center'>
        <h1 className="text-2xl font-bold mb-4">Order Food</h1>
                {/* Cart Link */}
                <div className="mt-6">
          <Link
            to="/cart"
            className="bg-green-600 text-white mb-4 px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
          >
            View Cart ({cart.length})
          </Link>
        </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-lg font-semibold mb-2">Filter by Category:</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(category)
                        ? prev.filter((cat) => cat !== category)
                        : [...prev, category]
                    );
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">Filter by Restaurant:</label>
            <div className="flex flex-wrap gap-2">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant}
                  onClick={() => {
                    setSelectedRestaurants((prev) =>
                      prev.includes(restaurant)
                        ? prev.filter((res) => res !== restaurant)
                        : [...prev, restaurant]
                    );
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedRestaurants.includes(restaurant)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {restaurant}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-bold">{item.name}</h2>
              <p className="text-gray-600">
                {item.restaurant} - {item.location}
              </p>
              <p className="text-green-600 font-semibold">{item.price} LKR</p>
              <p
                className={`text-sm font-semibold ${
                  item.availability === 'In Stock' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.availability}
              </p>
              <button
                onClick={() => addToCart(item)}
                disabled={item.availability !== 'In Stock'}
                className={`w-full mt-4 px-4 py-2 rounded-lg ${
                  item.availability === 'In Stock'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                }`}
              >
                {item.availability === 'In Stock' ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default OrderPage;