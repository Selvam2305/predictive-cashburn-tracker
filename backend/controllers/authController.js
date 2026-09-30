import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'predictive_cashburn_secret_key_2026';

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { email, password, monthlyBudget } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      monthlyBudget: monthlyBudget ? Number(monthlyBudget) : 50000,
    });

    const token = generateToken(user._id, user.email);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.email);

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    if (monthlyBudget === undefined || monthlyBudget < 0) {
      return res.status(400).json({ message: 'Valid positive monthly budget required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { monthlyBudget: Number(monthlyBudget) },
      { new: true }
    );

    return res.json({
      message: 'Monthly budget updated successfully',
      monthlyBudget: user.monthlyBudget,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update budget', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
