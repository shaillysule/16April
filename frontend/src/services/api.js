// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = {
  // Stock related endpoints
  getStocks: () => axios.get(`${API_URL}/stocks`),
  getStockBySymbol: (symbol) => axios.get(`${API_URL}/stocks/${symbol}`),
  
  // Other endpoints as needed
  // Portfolio related endpoints
  getPortfolio: () => axios.get(`${API_URL}/portfolio`),
  
  // Authentication related endpoints
  login: (credentials) => axios.post(`${API_URL}/auth/login`, credentials),
  register: (userData) => axios.post(`${API_URL}/auth/register`, userData),
};

export default api;