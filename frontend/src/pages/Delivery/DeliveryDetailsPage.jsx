import DeliveryMap from "../../components/Maps/DeliveryMap";

const driverLocation = { lat: 6.054, lng: 80.221 }; // from backend
const deliveryLocation = { lat: 6.06, lng: 80.223 }; // from order (via Geocoding API)

<DeliveryMap
  driverLocation={driverLocation}
  deliveryLocation={deliveryLocation}
/>;
