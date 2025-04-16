import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthorized(false);
          return;
        }

        // Get the user info to check their role
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // If a required role is specified, check if user has that role
        if (requiredRole) {
          setIsAuthorized(response.data.role === requiredRole);
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Authorization error:", error);
        setIsAuthorized(false);
      }
    };

    verifyUser();
  }, [requiredRole]);

  // If still checking, show a loading indicator
  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p>Verifying access...</p>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to="/" />;
};

export default ProtectedRoute;