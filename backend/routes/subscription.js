const express = require('express');
const router = express.Router();
const {authMiddleware} = require('./auth');
const User = require('../models/User');
const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

// PayPal Sandbox Environment
const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Create PayPal Order
router.post('/create-paypal-order', authMiddleware, async (req, res) => {
    try {
        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: { currency_code: 'USD', value: '9.99' },
                description: 'AI Subscription'
            }],
        });

        const order = await client.execute(request);
        res.json({ id: order.result.id }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'PayPal order creation failed' });
    }
});

// Capture PayPal Order
router.post('/capture-paypal-order', authMiddleware, async (req, res) => {
    try {
        const { orderID } = req.body;
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const capture = await client.execute(request);

        if (capture.result.status === 'COMPLETED') {
            const user = await User.findById(req.user);  // Fix req.User → req.user
            user.isSubscribed = true;
            await user.save();
        }

        res.json({ status: capture.result.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'PayPal capture failed' });
    }
});

module.exports = router;
