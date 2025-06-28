const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// === Multer Setup for Profile Photo Upload ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// === Signup Route ===
router.post("/signup", upload.single("photo"), async (req, res) => {
  try {
    const { firstName, lastName, email, password, mobile } = req.body;

    // Basic validation
    if (!firstName || !email || !password) {
      return res
        .status(400)
        .json({ message: "First name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const photoPath = req.file ? "/uploads/" + req.file.filename : null;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
      photo: photoPath,
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful!",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        email: newUser.email,
        photo: newUser.photo
          ? `${req.protocol}://${req.get("host")}${newUser.photo}`
          : null,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// === Login Route ===
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    req.session.user = user._id;
    req.session.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        photo: user.photo,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// === Edit Profile Route ===
router.put("/edit-profile", upload.single("photo"), async (req, res) => {
  try {
    const { userId, firstName, lastName, mobile, oldPassword, newPassword } =
      req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (firstName?.trim()) user.firstName = firstName.trim();
    if (lastName?.trim()) user.lastName = lastName.trim();
    if (mobile?.trim()) user.mobile = mobile.trim();
    if (req.file) user.photo = "/uploads/" + req.file.filename;

    // Change password if requested
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        photo: user.photo,
      },
    });
  } catch (err) {
    console.error("Edit Profile Error:", err);
    res.status(500).json({ message: "Server error during profile update" });
  }
});

module.exports = router;
