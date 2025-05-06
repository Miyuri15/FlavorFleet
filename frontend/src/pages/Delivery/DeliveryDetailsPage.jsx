import Layout from "../../components/Layout";
import DeliveryMap from "../../components/Maps/DeliveryMap";

const DeliveryDetailsPage = () => {
  const driverLocation = { lat: 6.054, lng: 80.221 }; // Replace with actual data from backend
  const deliveryLocation = { lat: 6.06, lng: 80.223 }; // Replace with actual data from order (via Geocoding API)

  if (!driverLocation || !deliveryLocation) {
    return <div>Loading delivery details...</div>; // Fallback UI
  }

  return (
    <Layout>
      <DeliveryMap
        driverLocation={driverLocation}
        deliveryLocation={deliveryLocation}
      />
    </Layout>
  );
};

export default DeliveryDetailsPage;
