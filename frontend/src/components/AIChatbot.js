import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const AIChatbot = ({ isSubscribed, freeAITrials }) => {
  const [symbol, setSymbol] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [sentiment, setSentiment] = useState(null);

  const handlePredict = async () => {
    if (!isSubscribed && freeAITrials <= 0) return alert('Please subscribe');
    const historicalData = [{ close: 100 }, { close: 102 }, { close: 101 }, { close: 105 }, { close: 107 }];
    const res = await axios.post('http://localhost:5000/api/stocks/predict', { symbol, historicalData }, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    setPrediction(res.data.predictedPrice);
    if (!isSubscribed) localStorage.setItem('freeAITrials', freeAITrials - 1);
  };

  const handleSentiment = async () => {
    if (!isSubscribed && freeAITrials <= 0) return alert('Please subscribe');
    const text = "The stock market is booming!";
    const res = await axios.post('http://localhost:5000/api/stocks/sentiment', { text }, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    setSentiment(res.data.sentiment);
    if (!isSubscribed) localStorage.setItem('freeAITrials', freeAITrials - 1);
  };

  return (
    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-gray-700 p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-2">AI Chatbot</h2>
      <input
        type="text"
        placeholder="Stock symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 mb-2 bg-gray-600 rounded text-white"
      />
      <div className="flex space-x-2">
        <button onClick={handlePredict} className="bg-blue-500 p-2 rounded hover:bg-blue-600">Predict</button>
        <button onClick={handleSentiment} className="bg-blue-500 p-2 rounded hover:bg-blue-600">Sentiment</button>
      </div>
      {prediction && <p className="mt-2 bg-green-500 p-2 rounded">Predicted: ${prediction.toFixed(2)}</p>}
      {sentiment && <p className={`mt-2 p-2 rounded ${sentiment === 'Positive' ? 'bg-green-500' : 'bg-red-500'}`}>Sentiment: {sentiment}</p>}
      {!isSubscribed && <p className="mt-2">Trials Left: {freeAITrials}</p>}
    </motion.div>
  );
};

export default AIChatbot;