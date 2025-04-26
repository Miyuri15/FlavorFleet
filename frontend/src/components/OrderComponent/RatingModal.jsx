import { useState } from "react";
import { FaStar, FaRegStar, FaTimes } from "react-icons/fa";

const RatingModal = ({ order, onClose, onSubmit }) => {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [itemRatings, setItemRatings] = useState({});
  const [feedback, setFeedback] = useState("");

  const handleItemRating = (itemId, rating) => {
    setItemRatings((prev) => ({ ...prev, [itemId]: rating }));
  };

  const handleSubmit = () => {
    const ratings = {
      restaurantRating,
      deliveryRating,
      itemRatings: Object.entries(itemRatings).map(([itemId, rating]) => ({
        itemId,
        rating,
      })),
      feedback,
      orderId: order._id,
    };
    onSubmit(ratings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Rate Your Order #{order._id.substring(order._id.length - 6).toUpperCase()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Restaurant Rating */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Restaurant Experience</h4>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={`restaurant-${star}`}
                  onClick={() => setRestaurantRating(star)}
                  className="text-3xl focus:outline-none transition-transform hover:scale-110"
                >
                  {star <= restaurantRating ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Rating */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Delivery Experience</h4>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={`delivery-${star}`}
                  onClick={() => setDeliveryRating(star)}
                  className="text-3xl focus:outline-none transition-transform hover:scale-110"
                >
                  {star <= deliveryRating ? (
                    <FaStar className="text-blue-400" />
                  ) : (
                    <FaRegStar className="text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Item Ratings */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Rate Your Items</h4>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.itemId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-md shadow-sm"
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × LKR {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`item-${item.itemId}-${star}`}
                        onClick={() => handleItemRating(item.itemId, star)}
                        className="text-xl focus:outline-none transition-transform hover:scale-110"
                      >
                        {star <= (itemRatings[item.itemId] || 0) ? (
                          <FaStar className="text-purple-400" />
                        ) : (
                          <FaRegStar className="text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">
              Additional Feedback (Optional)
            </h4>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Share your experience with this order..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Skip Rating
            </button>
            <button
              onClick={handleSubmit}
              disabled={restaurantRating === 0 || deliveryRating === 0}
              className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
                restaurantRating === 0 || deliveryRating === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Submit Rating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;