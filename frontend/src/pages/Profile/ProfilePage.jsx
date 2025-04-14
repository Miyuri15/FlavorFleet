import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import api from "../../../api";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      api
        .get(`/auth/current`) // Replace with your actual API endpoint
        .then((response) => {
          setProfileData(response.data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch profile data.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Layout>
      <div className="px-5">
        {profileData ? (
          <div>
            <p>Username: {profileData.username}</p>
            <p>Role: {profileData.role}</p>
            <p>Email: {profileData.email}</p>
          </div>
        ) : (
          <p>No profile data available.</p>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
