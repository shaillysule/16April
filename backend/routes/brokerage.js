const express = require('express');
const Alpaca = require('@alpacahq/alpaca-trade-api');
const router = express.Router();
const auth = require('./auth').auth;

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: true,
});

router.get('/account', auth, async (req, res) => {
  const account = await alpaca.getAccount();
  res.json(account);
});

router.post('/trade', auth, async (req, res) => {
  const { symbol, qty, side } = req.body;
  const order = await alpaca.createOrder({ symbol, qty, side, type: 'market', time_in_force: 'gtc' });
  res.json(order);
});

module.exports = router;