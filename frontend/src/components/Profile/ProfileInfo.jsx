import React from "react";

const ProfileInfo = ({ profileData, onEditResidence }) => {
  console.log("ProfileInfo component rendered with data:", profileData);
  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg shadow dark:shadow-gray-800">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">
        Basic Information
      </h2>
      <div className="space-y-3 text-text-light dark:text-text-dark">
        <p>
          <span className="font-medium">Username:</span> {profileData.username}
        </p>
        <p>
          <span className="font-medium">Role:</span> {profileData.role}
        </p>
        <p>
          <span className="font-medium">Email:</span> {profileData.email}
        </p>
        <div className="flex items-center">
          {profileData.residence && (
            <>
              {/* <p>Type: {profileData.residence.type}</p>
              <p>Coordinates: {profileData.residence.coordinates.join(", ")}</p> */}
              <p className="text-text-light dark:text-text-dark">
                Address: {profileData.residence.address || "Not specified"}
              </p>
            </>
          )}
          <button
            onClick={onEditResidence}
            className="ml-2 text-button-light dark:text-accent-dark hover:text-blue-800 dark:hover:text-accent-light text-sm"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
