import React, { useState } from "react";
import MenuItemCard from "./MenuItemCard";
import MenuItemForm from "./MenuItemForm";

const MenuList = ({ items, onEdit, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleAddItem = () => {
    setCurrentItem(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (itemData) => {
    if (currentItem) {
      // Update existing item
      await onEdit({ ...currentItem, ...itemData });
    } else {
      // Add new item
      await onEdit(itemData);
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleAddItem}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
        >
          Add Menu Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No menu items found</p>
          <button
            onClick={handleAddItem}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
          >
            Add Your First Menu Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <MenuItemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialValues={currentItem}
        isEditing={!!currentItem}
      />
    </div>
  );
};

export default MenuList;
