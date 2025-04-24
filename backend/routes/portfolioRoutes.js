const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');  // Ensure correct import of authenticateUser
const Portfolio = require('../models/Portfolio');
const { calculateRiskMetrics } = require('../utils/riskCalculator');

// Update risk metrics for a portfolio
router.post('/:portfolioId/update-risk', authenticateUser, async (req, res) => {
  try {
    let portfolio = await Portfolio.findById(req.params.portfolioId);
    
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Check if the portfolio belongs to the user or if the user is an admin
    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Calculate risk metrics
    const riskMetrics = await calculateRiskMetrics(portfolio);

    if (!riskMetrics) {
      return res.status(500).json({ msg: 'Failed to calculate risk metrics' });
    }

    // Update portfolio with the calculated risk metrics
    portfolio.riskMetrics = riskMetrics;
    await portfolio.save();

    res.json(portfolio);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all portfolios for the current user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id });
    res.json(portfolios);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a new portfolio
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, description, riskLevel } = req.body;
    
    const newPortfolio = new Portfolio({
      userId: req.user.id,
      name,
      description,
      riskLevel: riskLevel || 'moderate'  // Default to 'moderate' risk level
    });

    const portfolio = await newPortfolio.save();
    res.json(portfolio);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a specific portfolio
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Check if the portfolio belongs to the user or if the user is an admin
    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(portfolio);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update a portfolio
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { name, description, riskLevel } = req.body;
    
    let portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Check if the portfolio belongs to the user or if the user is an admin
    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Update fields
    if (name) portfolio.name = name;
    if (description) portfolio.description = description;
    if (riskLevel) portfolio.riskLevel = riskLevel;
    
    await portfolio.save();
    
    res.json(portfolio);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a portfolio
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Check if the portfolio belongs to the user or if the user is an admin
    if (portfolio.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await portfolio.remove();
    
    res.json({ msg: 'Portfolio removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
