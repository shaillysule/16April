const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Adjusted import path
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
router.post('/create-paypal-order', auth, async (req, res) => {
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
        console.error('PayPal order creation failed:', error);
        res.status(500).json({ error: 'PayPal order creation failed' });
    }
});

// Capture PayPal Order
router.post('/capture-paypal-order', auth, async (req, res) => {
    try {
        const { orderID } = req.body;
        if (!orderID) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});
        
        const capture = await client.execute(request);
        
        if (capture.result.status === 'COMPLETED') {
            const user = await User.findById(req.user.id); // Changed req.user to req.user.id
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            user.isSubscribed = true;
            user.subscriptionDate = new Date();
            await user.save();
        }
        
        res.json({ 
            status: capture.result.status,
            orderId: capture.result.id
        });
    } catch (error) {
        console.error('PayPal capture failed:', error);
        res.status(500).json({ error: 'PayPal capture failed' });
    }
});

module.exports = router;