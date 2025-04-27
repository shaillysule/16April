const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Generate JWT token with consistent format
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      // Include user.id for backward compatibility
      user: { id: user._id }
    },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "7d" }
  );
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email is gmail
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: "Please use a Gmail address (@gmail.com)" });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate token
    const token = generateToken(user);
    
    // Log successful login for debugging
    console.log('Login successful for:', email, 'with role:', user.role);

    // Send user data (safe fields only)
    res.json({
      token,
      role: user.role || "user",
      name: user.name || "",
      email: user.email,
      isSubscribed: user.subscriptionActive || user.isSubscribed || false,
      freeAITrials: user.freeAITrials || 0,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user._id,
      name: user.name || "",
      email: user.email,
      role: user.role || "user",
      isSubscribed: user.subscriptionActive || user.isSubscribed || false,
      freeAITrials: user.freeAITrials || 0,
    });
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate email is gmail
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: "Please use a Gmail address (@gmail.com)" });
    }
    
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default name if not provided
    const newUser = new User({
      name: name || email.split('@')[0], // Default name from email if not provided
      email,
      password: hashedPassword,
      role: "user",
      subscriptionActive: false,
      isSubscribed: false,
      freeAITrials: 3,
    });

    await newUser.save();

    // Return token
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      role: newUser.role,
      name: newUser.name || "",
      email: newUser.email,
      isSubscribed: newUser.subscriptionActive || newUser.isSubscribed || false,
      freeAITrials: newUser.freeAITrials || 0,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getMe
};