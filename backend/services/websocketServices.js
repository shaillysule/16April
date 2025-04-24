// Create a new file: services/websocketService.js
const WebSocket = require('ws');
const Stock = require('../models/stock');

let wss;

const initializeWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      
      if (data.type === 'SUBSCRIBE_STOCKS') {
        ws.stockSymbols = data.symbols;
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
};

const broadcastStockUpdates = async () => {
  if (!wss) return;
  
  const connectedClients = [...wss.clients].filter(client => client.readyState === WebSocket.OPEN);
  
  if (connectedClients.length === 0) return;
  
  // Get all subscribed symbols from connected clients
  const allSymbols = new Set();
  connectedClients.forEach(client => {
    if (client.stockSymbols && Array.isArray(client.stockSymbols)) {
      client.stockSymbols.forEach(symbol => allSymbols.add(symbol));
    }
  });
  
  if (allSymbols.size === 0) return;
  
  // Fetch latest stock data
  const stocks = await Stock.find({ symbol: { $in: Array.from(allSymbols) } });
  
  // Send updates to each client based on their subscriptions
  connectedClients.forEach(client => {
    if (!client.stockSymbols) return;
    
    const clientStocks = stocks.filter(stock => 
      client.stockSymbols.includes(stock.symbol)
    );
    
    if (clientStocks.length > 0) {
      client.send(JSON.stringify({
        type: 'STOCK_UPDATE',
        data: clientStocks
      }));
    }
  });
};

// Start the broadcast interval (e.g., every 5 seconds)
const startBroadcasting = () => {
  setInterval(broadcastStockUpdates, 5000);
};

module.exports = {
  initializeWebSocketServer,
  startBroadcasting
};