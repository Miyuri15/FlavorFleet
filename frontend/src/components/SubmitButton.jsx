import React from "react";

const SubmitButton = ({
  isSubmitting,
  isValid,
  submittingText = "Submitting...",
  defaultText = "Submit",
  className = "",
}) => (
  <button
    type="submit"
    disabled={isSubmitting || !isValid}
    className={`w-full px-4 py-2 bg-button-light text-white rounded hover:bg-blue-700 dark:bg-accent-dark dark:hover:bg-accent-light transition-colors ${
      isSubmitting || !isValid ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`}
  >
    {isSubmitting ? submittingText : defaultText}
  </button>
);

export default SubmitButton;
