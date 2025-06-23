const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// === Multer Setup for Profile Photo Upload ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// === Signup Route (with optional photo) ===
router.post('/signup', upload.single('photo'), async (req, res) => {
  const { firstName, lastName, mobile, email, password } = req.body;
  const photo = req.file ? '/uploads/' + req.file.filename : null;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ firstName, lastName, mobile, email, password, photo });
    await newUser.save();

    res.status(200).json({ message: "Signup successful!" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === Login Route ===
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password }); // TODO: Add password hashing in production
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ firstName: user.firstName, photo: user.photo });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === Edit Profile Route (PUT with optional photo, email NOT editable) ===
router.put('/edit-profile', upload.single('photo'), async (req, res) => {
  try {
    let { oldEmail, firstName, lastName, mobile, password } = req.body;

    if (!oldEmail) {
      return res.status(400).json({ message: "Email is required to identify user." });
    }

    const user = await User.findOne({ email: oldEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update only non-empty fields
    if (firstName?.trim()) user.firstName = firstName.trim();
    if (lastName?.trim()) user.lastName = lastName.trim();
    if (mobile?.trim()) user.mobile = mobile.trim();
    if (password?.trim()) user.password = password.trim(); // TODO: Hash in production
    if (req.file) user.photo = '/uploads/' + req.file.filename;

    await user.save();

    // ✅ FINAL JSON response — as needed
    res.status(200).json({
      message: "Profile updated!",
      firstName: user.firstName,
      photo: user.photo || null,
    });

  } catch (err) {
    console.error("Edit Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// === Get User by Email ===
router.get('/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      photo: user.photo
    });
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

module.exports = router;
