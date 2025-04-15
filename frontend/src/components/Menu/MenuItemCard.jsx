import React from "react";

const MenuItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
          </div>
          <span className="text-lg font-bold text-gray-900">
            LKR {item.price.toFixed(2)}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{item.description}</p>
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-medium text-gray-500">
              Ingredients:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.ingredients.map((ingredient, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              item.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.isAvailable ? "Available" : "Unavailable"}
          </span>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(item)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
