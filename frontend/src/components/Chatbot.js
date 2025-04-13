import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I can help with stock information. Ask me about stock prices, dividends, markets, or IPOs.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [
        ...prev,
        { text: "You need to log in to use the chatbot.", sender: 'bot' }
      ]);
    }
  }, []);

  // Send message to backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      // Add debug info
      console.log('Sending message to chatbot API:', userMessage);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Make the API call
      const response = await axios.post(
        '/api/chatbot',
        { message: userMessage },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Chatbot API response:', response.data);
      
      if (response.data && response.data.response) {
        setMessages(prev => [
          ...prev,
          { text: response.data.response, sender: 'bot' }
        ]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      
      let errorMessage = 'Error connecting to chatbot. Please try again later.';
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        
        if (error.response.status === 403) {
          errorMessage = 'Subscription required to use the chatbot.';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setMessages(prev => [
        ...prev,
        { text: errorMessage, sender: 'bot' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message bot loading">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., price of AAPL"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbot;