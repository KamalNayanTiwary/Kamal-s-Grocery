const express = require('express');
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// === MongoDB Connection ===
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://kamalnayantiwary73:Rwsi0tc5JCDWFxNM@test-pro-db.hodjgxk.mongodb.net/test-pro-db';

mongoose.connect(mongoURI)
  .then(() => console.log('🟢 MongoDB connected successfully'))
  .catch(err => {
    console.error('🔴 MongoDB connection error:', err.message);
    process.exit(1); // exit app on DB failure
  });

mongoose.set('debug', true); // Show DB queries in console

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// === CORS Setup (before routes!)
const corsOptions = {
  origin: "https://kamal-s-grocery.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Handle preflight requests

// === Session Setup ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// === Routes ===
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// === Dashboard Route (after login) ===
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }

  res.send(`
    <h2>Welcome, ${req.session.user}!</h2>
    <a href="/logout">Logout</a>
  `);
});

// === Logout Route ===
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
