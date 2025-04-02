import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const Error = ({ errorType: propErrorType }) => {
  const navigate = useNavigate();
  const { errorType: paramErrorType } = useParams();

  // Get error type from URL or fallback to prop (for 404)
  const errorType = propErrorType || paramErrorType || "unknown";

  const errorMessages = {
    404: "Page not found! The page you're looking for doesn't exist.",
    401: "Unauthorized! You need to log in to access this page.",
    403: "Forbidden! You don't have permission to access this page.",
    500: "Internal Server Error! Something went wrong on our end.",
    unknown: "Something went wrong! Please try again.",
  };

  const handleRedirect = () => {
    if (errorType === "403" || errorType === "401") {
      navigate("/login");
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-900 p-6">
      <h1 className="text-5xl font-extrabold animate-bounce flex items-center gap-2">
        ⚠️ Oops!
      </h1>
      <p className="mt-4 text-lg text-center font-medium">
        {errorMessages[errorType]}
      </p>
      <button
        onClick={handleRedirect}
        className={`mt-6 px-6 py-3 text-lg font-medium rounded-lg shadow-md transition duration-300 ${
          errorType === "403" || errorType === "401"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {errorType === "403" || errorType === "401" ? "Go to Login" : "Go Back"}
      </button>
    </div>
  );
};

export default Error;
