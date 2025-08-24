import React from "react";
import { Layout } from "../../components";
import { useProfile } from "../../hooks/useProfile";
import { useNotification } from "../../context/NotificationContext";
import { useFormValidation, validationRules } from "../../hooks/useFormValidation";
import { FormInput } from "../../components/Form";
import LoadingSpinner from "../../components/Loading/LoadingSpinner";
import ProfileInfo from "../../components/Profile/ProfileInfo";
import ResidenceForm from "../../components/Profile/ResidenceForm";
import { LoadScript } from "@react-google-maps/api";

const ProfilePageRefactored = () => {
  const { profileData, loading, error, changePassword, updateResidence } = useProfile();
  const { showToast } = useNotification();

  // Password change form validation
  const passwordForm = useFormValidation(
    {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    {
      currentPassword: [validationRules.required],
      newPassword: [validationRules.required, validationRules.password],
      confirmPassword: [
        validationRules.required,
        validationRules.confirmPassword("newPassword"),
      ],
    }
  );

  const handlePasswordChange = async (values) => {
    try {
      const result = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });

      if (result.success) {
        showToast.success("Password changed successfully!");
        passwordForm.resetForm();
      } else {
        showToast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      showToast.error("An unexpected error occurred");
    }
  };

  const handleResidenceUpdate = async (residenceData) => {
    try {
      const result = await updateResidence({
        residence: {
          type: "Point",
          coordinates: [residenceData.location.lng, residenceData.location.lat],
        },
        address: residenceData.place,
      });

      if (result.success) {
        showToast.success("Residence updated successfully!");
      } else {
        showToast.error(result.error || "Failed to update residence");
      }
    } catch (error) {
      showToast.error("An unexpected error occurred");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">No profile data available</h2>
          </div>
        </div>
      </Layout>
    );
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>
          
          {/* Profile Information Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
            <ProfileInfo profileData={profileData} />
          </div>

          {/* Residence Update Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Residence</h2>
            <ResidenceForm
              currentResidence={profileData.residence}
              onUpdate={handleResidenceUpdate}
            />
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                passwordForm.handleSubmit(handlePasswordChange);
              }}
              className="space-y-4"
            >
              <FormInput
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordForm.values.currentPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.errors.currentPassword}
                touched={passwordForm.touched.currentPassword}
                required
                placeholder="Enter your current password"
              />

              <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.errors.newPassword}
                touched={passwordForm.touched.newPassword}
                required
                placeholder="Enter your new password"
              />

              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordForm.values.confirmPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.errors.confirmPassword}
                touched={passwordForm.touched.confirmPassword}
                required
                placeholder="Confirm your new password"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordForm.isSubmitting || !passwordForm.isValid}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {passwordForm.isSubmitting ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </LoadScript>
  );
};

export default ProfilePageRefactored;
