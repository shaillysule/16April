// stockData.js
import axios from 'axios';

const fetchStockData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/stocks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
};

export default fetchStockData;

