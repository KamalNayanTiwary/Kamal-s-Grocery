// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  mobile: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String }
});

module.exports = mongoose.model('User', userSchema);
