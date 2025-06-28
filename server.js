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
    process.exit(1);
  });

mongoose.set('debug', true);

// === CORS Setup (must be before all routes) ===
const corsOptions = {
  origin: "https://kamal-s-grocery.vercel.app",  
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// === Session Setup (updated for cross-origin)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,          
    sameSite: 'none'       
  }
}));

// === Routes ===
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// === Dashboard Route (optional)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }

  res.send(`
    <h2>Welcome, ${req.session.user}!</h2>
    <a href="/logout">Logout</a>
  `);
});

// === Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
