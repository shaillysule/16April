// src/AdminPanel.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
        setError(null);
      } catch (err) {
        console.error("Admin fetch error:", err);
        setError(
          err.response?.status === 403 
            ? "Access denied. You need admin privileges."
            : "Failed to load users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllUsers();
  }, [navigate]);

  const handleRoleChange = async (userId, currentRole) => {
    try {
      const token = localStorage.getItem("token");
      const newRole = currentRole === "admin" ? "user" : "admin";
      
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update the local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Role update error:", err);
      alert("Failed to update user role");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="bg-red-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-600 py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Admin Panel</h1>
        <button 
          className="bg-blue-600 py-2 px-4 rounded hover:bg-blue-700"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-300">
          Total Users: <span className="font-bold">{users.length}</span>
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-gray-800 rounded shadow">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Portfolio Count</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-600">
                <td className="p-3">{user.name || "N/A"}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded ${
                    user.role === "admin" ? "bg-purple-700" : "bg-blue-700"
                  }`}>
                    {user.role || "user"}
                  </span>
                </td>
                <td className="p-3">{user.portfolio?.length || 0}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleRoleChange(user._id, user.role)}
                    className={`px-3 py-1 rounded ${
                      user.role === "admin"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;