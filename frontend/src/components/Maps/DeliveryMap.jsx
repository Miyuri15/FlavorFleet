import React, { useState, useCallback } from "react";
import { LoadScript } from "@react-google-maps/api";
import axios from "axios";
import MapControls from "./MapControls";
import MapDisplay from "./MapDisplay";
import MapMarker from "./MapMarker";
import Directions from "./Directions";
import { useNavigate } from "react-router-dom";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const DeliveryMap = () => {
  const [map, setMap] = useState(null);
  const [response, setResponse] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [markerPosition, setMarkerPosition] = useState(null);
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  const navigate = useNavigate();

  const directionsCallback = useCallback((response) => {
    if (response !== null) {
      if (response.status === "OK") {
        setResponse(response);
        setDistance(response.routes[0].legs[0].distance.text);
        setDuration(response.routes[0].legs[0].duration.text);
      } else {
        console.error("Error:", response);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (origin && destination) {
      setResponse(null);
    }
  };

  const handlePlaceMarker = async (address) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        setMarkerPosition(location);
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        } else {
          console.warn("Map is not loaded yet. Cannot pan or set zoom.");
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  return (
    <div className="map-container">
      <MapControls
        origin={origin}
        destination={destination}
        distance={distance}
        duration={duration}
        onOriginChange={(e) => setOrigin(e.target.value)}
        onDestinationChange={(e) => setDestination(e.target.value)}
        onPlaceMarker={handlePlaceMarker}
        onSubmit={handleSubmit}
      />

      <LoadScript googleMapsApiKey={apiKey}>
        <MapDisplay
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={10}
          onLoad={(map) => setMap(map)}
          onClick={(e) => {
            setMarkerPosition({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            });
          }}
        >
          <MapMarker position={markerPosition} />
          <Directions
            origin={origin}
            destination={destination}
            response={response}
            onDirectionsCallback={directionsCallback}
          />
        </MapDisplay>
      </LoadScript>
    </div>
  );
};

export default DeliveryMap;

// import React, { useState, useCallback, useEffect } from "react";
// import { LoadScript } from "@react-google-maps/api";
// import MapControls from "./MapControls";
// import MapDisplay from "./MapDisplay";
// import MapMarker from "./MapMarker";
// import Directions from "./Directions";

// const containerStyle = {
//   width: "100%",
//   height: "500px",
//   borderRadius: "8px",
// };

// const DeliveryMap = ({ driverLocation, deliveryLocation }) => {
//   const [map, setMap] = useState(null);
//   const [response, setResponse] = useState(null);
//   const [distance, setDistance] = useState("");
//   const [duration, setDuration] = useState("");
//   const [apiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

//   // Set default center between driver and delivery locations
//   const defaultCenter = driverLocation || {
//     lat: 6.054,
//     lng: 80.221,
//   };

//   const directionsCallback = useCallback((response) => {
//     if (response !== null) {
//       if (response.status === "OK") {
//         setResponse(response);
//         setDistance(response.routes[0].legs[0].distance.text);
//         setDuration(response.routes[0].legs[0].duration.text);
//       } else {
//         console.error("Error:", response);
//       }
//     }
//   }, []);

//   // Auto-calculate directions when locations are provided
//   useEffect(() => {
//     if (driverLocation && deliveryLocation && map) {
//       setResponse(null); // Reset previous directions
//     }
//   }, [driverLocation, deliveryLocation, map]);

//   return (
//     <div className="map-container">
//       <LoadScript googleMapsApiKey={apiKey}>
//         <MapDisplay
//           mapContainerStyle={containerStyle}
//           center={defaultCenter}
//           zoom={14}
//           onLoad={(map) => setMap(map)}
//         >
//           {/* Driver Marker */}
//           {driverLocation && (
//             <MapMarker
//               position={driverLocation}
//               icon={{
//                 url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//               }}
//             />
//           )}

//           {/* Delivery Location Marker */}
//           {deliveryLocation && (
//             <MapMarker
//               position={deliveryLocation}
//               icon={{
//                 url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//               }}
//             />
//           )}

//           {/* Directions between points */}
//           {driverLocation && deliveryLocation && (
//             <Directions
//               origin={driverLocation}
//               destination={deliveryLocation}
//               response={response}
//               onDirectionsCallback={directionsCallback}
//             />
//           )}
//         </MapDisplay>
//       </LoadScript>

//       {/* Display distance and duration */}
//       {distance && duration && (
//         <div className="map-info">
//           <p>Distance: {distance}</p>
//           <p>Duration: {duration}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DeliveryMap;
