import React from "react";
import { GoogleMap } from "@react-google-maps/api";

const MapDisplay = ({
  mapContainerStyle,
  center,
  zoom,
  onLoad,
  onClick,
  children,
}) => {
  return (
    <div className="map-display rounded-md overflow-hidden shadow-md">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onClick={onClick}
      >
        {children}
      </GoogleMap>
    </div>
  );
};

export default MapDisplay;
