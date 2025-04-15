import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../../api";
import ProfileInfo from "../../components/Profile/ProfileInfo";
import ResidenceForm from "../../components/Profile/ResidenceForm";
import ChangePasswordForm from "../../components/Profile/ChangePasswordForm";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isEditingResidence, setIsEditingResidence] = useState(false);
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage({ text: "Password changed successfully", type: "success" });
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to change password",
        type: "error",
      });
    }
  };

  const handleResidenceUpdate = async (e) => {
    e.preventDefault();

    try {
      await api.put("/auth/update-residence", {
        residence: formData.residence,
      });

      setProfileData((prev) => ({ ...prev, residence: formData.residence }));
      setIsEditingResidence(false);
      setMessage({ text: "Residence updated successfully", type: "success" });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to update residence",
        type: "error",
      });
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="px-5">Loading...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="px-5">{error}</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="px-5 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {profileData && (
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

            <ChangePasswordForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handlePasswordChange}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
