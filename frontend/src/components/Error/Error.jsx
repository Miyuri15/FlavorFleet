// src/components/Error/Error.jsx
import React from 'react';

const Error = ({ error }) => {
  return (
    <div className="p-4 bg-red-100 text-red-900">
      <h1 className="text-3xl font-bold">Error</h1>
      <p className="mt-2">{error.message}</p>
    </div>
  );
};

export default Error;