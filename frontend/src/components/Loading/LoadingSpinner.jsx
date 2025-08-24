import React from "react";
import { ClipLoader } from "react-spinners";

const LoadingSpinner = ({
  size = 40,
  color = "#3B82F6",
  text = "Loading...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ClipLoader
        color={color}
        size={size}
        loading={true}
        css={{ display: "block", margin: "0 auto" }}
      />
      <p className="mt-4 text-gray-600 text-lg">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
