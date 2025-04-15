import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../../api";
import ProfileInfo from "../../components/Profile/ProfileInfo";
import ResidenceForm from "../../components/Profile/ResidenceForm";
import ChangePasswordForm from "../../components/Profile/ChangePasswordForm";
import Swal from "sweetalert2";
import Loading from "../../components/Loading/Loading";
import { LoadScript } from "@react-google-maps/api";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingResidence, setIsEditingResidence] = useState(false);
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    residence: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await api.get(`/auth/current`);
      setProfileData(response.data);
      setFormData((prev) => ({
        ...prev,
        residence: response.data.residence || "",
      }));
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch profile data.");
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch profile data.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (values) => {
    try {
      await api.post("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password changed successfully",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to change password",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const handleResidenceUpdate = async (residenceData) => {
    try {
      await api.put("/auth/update-residence", {
        residence: {
          type: "Point",
          coordinates: [residenceData.location.lng, residenceData.location.lat],
          address: residenceData.place,
        },
      });

      setProfileData((prev) => ({
        ...prev,
        residence: {
          ...prev.residence,
          coordinates: [residenceData.location.lng, residenceData.location.lat],
          address: residenceData.place,
        },
      }));

      setIsEditingResidence(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Residence updated successfully",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update residence",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  if (loading)
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="px-5 text-text-light dark:text-text-dark">{error}</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="px-5 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-text-light dark:text-primary-dark">
          Profile
        </h1>

        {profileData && (
          <LoadScript googleMapsApiKey={apiKey}>
            <div className="space-y-6">
              <ProfileInfo
                profileData={profileData}
                onEditResidence={() => setIsEditingResidence(true)}
              />

              {isEditingResidence && (
                <ResidenceForm
                  residence={formData.residence}
                  onInputChange={handleInputChange}
                  onSubmit={handleResidenceUpdate}
                  onCancel={() => setIsEditingResidence(false)}
                />
              )}

              <ChangePasswordForm onSubmit={handlePasswordChange} />
            </div>
          </LoadScript>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
