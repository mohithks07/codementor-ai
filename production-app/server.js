/**
 * CodeMentor AI - Production Web Server
 * Optimized for deployment on Vercel/AWS/Heroku
 */

const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", API_BASE]
    }
  }
}));

// Performance middleware
app.use(compression());
app.use(cors());

// API routes first (before catch-all)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'CodeMentor AI Web App',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API endpoints
app.get('/test', async (req, res) => {
  try {
    const healthResponse = await axios.get(`${API_BASE}/health`);
    const modulesResponse = await axios.get(`${API_BASE}/api/modules`);
    const topicsResponse = await axios.get(`${API_BASE}/api/topics`);
    
    res.json({
      success: true,
      results: {
        health: healthResponse.data,
        modules: modulesResponse.data,
        topics: topicsResponse.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auth endpoints
app.post('/test-register', async (req, res) => {
  try {
    const userData = {
      username: `webuser_${Date.now()}`,
      email: `webuser_${Date.now()}@codementor.ai`,
      password: 'Password123',
      firstName: 'Web',
      lastName: 'User'
    };
    
    const response = await axios.post(`${API_BASE}/api/auth/register`, userData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

app.post('/test-login', async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// Quiz endpoints
app.get('/test-quiz/:topicId', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/api/quiz/topic/${req.params.topicId}/public`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// AI Chat endpoints
app.post('/test-ai-chat', async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE}/api/ai/chat`, req.body, {
      headers: {
        'Authorization': `Bearer ${req.body.token}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || { error: error.message });
  }
});

// Main route - serve the actual app
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'CodeMentor AI - Learn Programming with AI',
    apiBase: API_BASE,
    isProduction: true
  });
});

// Production catch-all - only in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.render('index', { 
      title: 'CodeMentor AI - Learn Programming with AI',
      apiBase: API_BASE,
      isProduction: true
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CodeMentor AI Production Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Backend API: ${API_BASE}`);
  console.log(`🌐 Ready for production deployment!`);
});

module.exports = app;
