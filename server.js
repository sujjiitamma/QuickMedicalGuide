// server.js
// Simple Cashfree PG (Sandbox) backend for Quick Medical Guide

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Cashfree PG Sandbox endpoints
const CF_BASE = 'https://sandbox.cashfree.com/pg';

// Create order — called by the frontend
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', customer } = req.body;

    // Create your own unique order ID (for demo, timestamp-based)
    const orderId = 'QMG-' + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: Number(amount || 1),
      order_currency: currency,
      customer_details: {
        customer_id: customer?.id || 'demo_user_001',
        customer_name: customer?.name || 'Demo User',
        customer_email: customer?.email || 'demo@example.com',
        customer_phone: customer?.phone || '9999999999'
      },
      order_note: 'Quick Medical Guide — demo payment',
      order_meta: {
        return_url: `${BASE_URL}/payment/return?order_id={order_id}`,
        notify_url: `${BASE_URL}/webhook/cashfree`
      }
    };

    const headers = {
      'x-client-id': process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json'
    };

    const { data } = await axios.post(`${CF_BASE}/orders`, payload, { headers });

    // Expecting payment_session_id in response; also keep order_id
    return res.json({
      success: true,
      order_id: data?.order_id || orderId,
      payment_session_id: data?.payment_session_id || data?.order_token,
      raw: data
    });
  } catch (err) {
    console.error('Create order error:', err?.response?.data || err.message);
    return res.status(500).json({ success: false, error: err?.response?.data || err.message });
  }
});

// Verify order — server-to-server status check
app.get('/api/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const headers = {
      'x-client-id': process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      'x-api-version': '2023-08-01'
    };

    const { data } = await axios.get(`${CF_BASE}/orders/${orderId}`, { headers });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Verify error:', err?.response?.data || err.message);
    return res.status(500).json({ success: false, error: err?.response?.data || err.message });
  }
});

// Webhook — Cashfree notifies here on payment events
app.post('/webhook/cashfree', async (req, res) => {
  try {
    // For a real app, validate signature from headers before trusting payload
    // Example headers: x-webhook-signature, x-webhook-timestamp (check Cashfree docs)
    const event = req.body;
    console.log('Cashfree webhook event:', JSON.stringify(event, null, 2));

    // TODO: update your DB based on event.type / data.payment_status

    res.status(200).send('OK');
  } catch (e) {
    console.error('Webhook handling error:', e.message);
    res.status(500).send('ERR');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at ${BASE_URL}`);
});