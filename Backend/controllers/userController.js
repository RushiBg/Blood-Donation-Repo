const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password: hashed,
      verified: false // Ensure user starts as unverified
    });

    // Don't return token on registration - user needs to verify first
    res.status(201).json({ 
      message: 'Registration successful. Please verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ message: 'Failed to register', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(401).json({ 
        message: 'Account not verified. Please verify your account before logging in.',
        needsVerification: true
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ message: 'Failed to login', error: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

module.exports = { register, login, getUsers }; 