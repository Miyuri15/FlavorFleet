import { useState, useEffect } from "react";
import { authService, handleApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const useProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      setProfileData(response.data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, "Failed to fetch profile data"));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(data);
      setProfileData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to update profile");
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to change password");
      return { success: false, error: errorMessage };
    }
  };

  const updateResidence = async (residenceData) => {
    try {
      await authService.updateResidence(residenceData);
      await fetchProfile(); // Refresh profile data
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to update residence");
      return { success: false, error: errorMessage };
    }
  };

  return {
    profileData,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    updateResidence,
  };
};
