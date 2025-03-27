router.get('/realtime/:symbol', auth, async (req, res) => {
    const { symbol } = req.params;
    const realTimeRes = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
    const quote = realTimeRes.data['Global Quote'];
    res.json({
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
    });
  });