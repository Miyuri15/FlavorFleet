import React from "react";
import { DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

const Directions = ({
  origin,
  destination,
  response,
  onDirectionsCallback,
}) => {
  return (
    <>
      {origin && destination && !response && (
        <DirectionsService
          options={{
            destination: destination,
            origin: origin,
            travelMode: "DRIVING",
          }}
          callback={onDirectionsCallback}
        />
      )}
      {response && <DirectionsRenderer directions={response} />}
    </>
  );
};

export default Directions;
