export default function OrderSummary({ items, paymentMethod, deliveryDetails, onPlaceOrder, totals }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="divide-y">
        {items.map(item => (
          <div key={item._id} className="py-4 flex justify-between">
            <div>
              <h3 className="font-medium">{item.menuItemName}</h3>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              {item.restaurantName && (
                <p className="text-xs text-gray-500 mt-1">From: {item.restaurantName}</p>
              )}
            </div>
            <p className="font-medium">LKR {(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2 pt-4 border-t">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>LKR {totals.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>LKR {totals.shipping}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax (15%)</span>
          <span>LKR {totals.tax}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-800 pt-2">
          <span>Total</span>
          <span>LKR {totals.total}</span>
        </div>
      </div>

      {paymentMethod && deliveryDetails && (
        <div className="mt-8">
          <h3 className="font-medium mb-2">Delivery To:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 font-medium">{deliveryDetails.fullName}</p>
            <p className="text-gray-700">{deliveryDetails.address}</p>
            <p className="text-gray-700">{deliveryDetails.city}, {deliveryDetails.postalCode}</p>
            <p className="text-gray-700">{deliveryDetails.contactNo}</p>
          </div>

          <button
            onClick={onPlaceOrder}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            {paymentMethod === 'cash' ? 'Confirm Order' : 'Proceed to Payment'}
          </button>
        </div>
      )}
    </div>
  );
}