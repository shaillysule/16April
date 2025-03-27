import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate(); // ✅ Updated

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? 'signup' : 'login';
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isSubscribed', res.data.isSubscribed);
      localStorage.setItem('freeAITrials', res.data.freeAITrials);
      navigate('/dashboard'); // ✅ Updated
    } catch (err) {
      console.error(err.response.data.msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
          {isSignup ? 'Sign Up' : 'Login'}
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-gray-900"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-gray-900"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p
          className="text-center mt-4 text-blue-500 cursor-pointer"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </p>
        <p className="text-center mt-4 text-gray-600 text-sm">Powered by xAI</p>
      </motion.div>
    </div>
  );
};

export default Login;
