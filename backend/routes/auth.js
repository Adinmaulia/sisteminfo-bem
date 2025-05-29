const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Admin login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
  res.json({ token });
});

// User login
router.post('/users/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);
  res.json({ token });
});

// New endpoint to get current user info
router.get('/me', authMiddleware(), async (req, res) => {
  try {
    const { id, role } = req.user; // from authMiddleware
    let userData;
    if (role === 'admin') {
      const admin = await Admin.findById(id).select('-password');
      if (!admin) return res.status(404).json({ msg: 'Admin not found' });
      userData = { id: admin._id, username: admin.username, role: 'admin', name: admin.name || '' };
    } else {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ msg: 'User not found' });
      userData = { id: user._id, username: user.username, role: 'user', name: user.name || '' };
    }
    res.json(userData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
