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
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onClick={onClick}
    >
      {children}
    </GoogleMap>
  );
};

export default MapDisplay;
