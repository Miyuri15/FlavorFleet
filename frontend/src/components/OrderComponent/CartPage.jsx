import React, { useState } from 'react';
import Layout from '../Layout';
import { FaTrash } from 'react-icons/fa'; // Import trash icon from react-icons
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const CartPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Dummy cart data with restaurant, location, and checked status
  const [cart, setCart] = useState([
    {
      id: 1,
      name: 'Cheeseburger',
      restaurant: 'Burger King',
      location: 'New York',
      price: 8.99,
      quantity: 2,
      image: '/img/Cheeseburger.jpeg', // Placeholder image URL
      checked: true, // Initially checked
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      restaurant: 'Pizza Hut',
      location: 'Los Angeles',
      price: 12.99,
      quantity: 1,
      image: '/img/PepperoniPizza.jpg', // Placeholder image URL
      checked: true, // Initially checked
    },
  ]);

  // Calculate total price for checked items only
  const totalPrice = cart.reduce(
    (total, item) => (item.checked ? total + item.price * item.quantity : total),
    0
  );

  // Place order
  const placeOrder = () => {
    const selectedItems = cart.filter((item) => item.checked);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to place an order.');
      return;
    }

    // Navigate to PaymentPage with cart and total price
    navigate('/payment', {
      state: {
        cart: selectedItems,
        totalPrice,
      },
    });
  };

  // Toggle checkbox for an item
  const toggleCheckbox = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setCart(updatedCart);
  };

  // Remove item from the cart
  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  };

  // Increase quantity of an item
  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  // Decrease quantity of an item
  const decreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    );
    setCart(updatedCart);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">Your Cart</h1>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow-sm mb-4 flex items-center space-x-4 relative"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheckbox(item.id)}
                    className="w-5 h-5 cursor-pointer"
                  />

                  {/* Food Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  {/* Food Details */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    <p className="text-gray-600 text-sm">
                      {item.restaurant} • {item.location}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span className="text-lg font-bold">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Trash Icon to Remove Item (Top-Right Corner) */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </>
          ) : (
            <p className="text-center text-gray-600">Your cart is empty.</p>
          )}
        </div>

        {/* Sticky Footer with Total and Place Order Button */}
        <div className="sticky bottom-0 bg-white p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-bold">Total</p>
            <p className="text-lg font-bold">${totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={placeOrder}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all"
            disabled={cart.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;