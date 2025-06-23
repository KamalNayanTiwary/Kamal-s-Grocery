const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// ✅ Dashboard Route
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }

  res.send(`
    <h2>Welcome, ${req.session.user}!</h2>
    <a href="/logout">Logout</a>
  `);
});

// ✅ Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
