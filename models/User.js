const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: String,
  mobile: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
