import React from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="px-5">
        <h1>{user ? user.username : "Guest"} ProfilePage</h1>

        <div>
          <p>Username: {user.username}</p>
          <p>Role: {user.role}</p>
          <p>Token: {user.token}</p>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
