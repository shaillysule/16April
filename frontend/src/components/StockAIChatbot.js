// src/components/StockAIChatbot.js
import React, { useState, useEffect, useRef } from 'react';
import './StockAIChatbot.css';

const StockAIChatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! I\'m your Stock AI Assistant. Ask me anything about stocks, market trends, or your portfolio.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history from local storage on component mount
    const savedHistory = localStorage.getItem('stockChatHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setMessages(parsedHistory);
        // Extract just the text for context to send to API
        const contextHistory = parsedHistory.map(msg => ({
          role: msg.sender === 'bot' ? 'assistant' : 'user',
          content: msg.text
        }));
        setConversationHistory(contextHistory);
      } catch (e) {
        console.error('Error parsing chat history:', e);
      }
    }
  }, []);

  // Save conversation history to local storage whenever it changes
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('stockChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage = { text: input, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    // Update conversation history for context
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: input }
    ];
    setConversationHistory(updatedHistory);
    
    try {
      const response = await fetch('/api/chatbot/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: input,
          conversationHistory: updatedHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      const botMessage = { text: data.response, sender: 'bot' };
      setMessages([...updatedMessages, botMessage]);
      
      // Update conversation history with bot response
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: data.response }
      ]);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages([...updatedMessages, { 
        text: 'Sorry, I encountered an error processing your request. Please try again later.', 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const clearConversation = () => {
    const initialMessage = { 
      text: 'Hello! I\'m your Stock AI Assistant. Ask me anything about stocks, market trends, or your portfolio.', 
      sender: 'bot' 
    };
    setMessages([initialMessage]);
    setConversationHistory([]);
    localStorage.removeItem('stockChatHistory');
  };

  return (
    <div className="stock-chatbot-container">
      <div className="stock-chatbot-header">
        <h3>Stock AI Assistant</h3>
        <button onClick={clearConversation} className="clear-button">Clear Chat</button>
      </div>
      <div className="stock-chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="stock-chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about stocks, trends, or your portfolio..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default StockAIChatbot;