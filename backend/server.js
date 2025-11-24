const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Hardcoded credentials - FOR DEVELOPMENT ONLY
// TODO: Replace with proper user authentication in production
const VALID_USERNAME = 'EVison';
const VALID_PASSWORD = 'PattyMac';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session configuration - FOR DEVELOPMENT ONLY
// TODO: For production:
// - Use environment variable for session secret
// - Enable secure: true when using HTTPS
// - Add CSRF protection middleware
// - Implement rate limiting
app.use(session({
  secret: 'evisionbet-secret-key-2024', // TODO: Use env variable in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // TODO: Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    req.session.user = { username };
    res.json({ success: true, username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/api/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, username: req.session.user.username });
  } else {
    res.json({ authenticated: false });
  }
});

// TODO: Add rate limiting middleware in production
app.get('/api/todo', requireAuth, (req, res) => {
  const todoPath = path.join(__dirname, '..', 'TODO.md');
  
  fs.readFile(todoPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read TODO.md' });
    } else {
      res.json({ content: data });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
