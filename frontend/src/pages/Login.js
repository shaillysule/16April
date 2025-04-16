// src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Add this import

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

// In Login.js (handleSubmit function)
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    
    // Properly access the values from response
    const token = res.data.token;
    const userRole = res.data.role || "user";
    const userName = res.data.name || "";
    const userEmail = res.data.email || email;
    const isUserSubscribed = res.data.isSubscribed || false;
    const userFreeAITrials = res.data.freeAITrials || 0;

    // Store in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("name", userName);
    localStorage.setItem("email", userEmail);
    localStorage.setItem("isSubscribed", String(isUserSubscribed));
    localStorage.setItem("freeAITrials", String(userFreeAITrials));
    
    console.log('Login successful', res.data);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    navigate(userRole === "admin" ? "/admin" : "/dashboard");
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    setError("Invalid email or password");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        {/* Add the Sign Up link here */}
        <p className="text-center mt-4">
          Need an account? 
          <Link to="/signup" className="text-blue-500 hover:underline ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
