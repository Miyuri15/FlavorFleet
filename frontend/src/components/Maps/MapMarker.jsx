import React from "react";
import { Marker } from "@react-google-maps/api";

const MapMarker = ({ position }) => {
  if (!position) return null;
  return <Marker position={position} />;
};

export default MapMarker;
