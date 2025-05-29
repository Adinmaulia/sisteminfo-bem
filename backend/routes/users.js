// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// PROTECTED: only admin
router.use(authMiddleware('admin'));

// GET /users - dapatkan semua user
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /users/:id - dapatkan user berdasarkan id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ msg: 'User tidak ditemukan' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PROTECTED: only admin
router.use(authMiddleware('admin'));

// POST /users - buat user baru
router.post('/', async (req, res) => {
  const { nama, username, password, level } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nama, username, password: hashedPassword, level });
    await newUser.save();

    res.status(201).json({ msg: 'User berhasil dibuat' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /users/:id - update user
router.put('/:id', async (req, res) => {
  const { nama, username, password, level } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User tidak ditemukan' });

    if (nama) user.nama = nama;
    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (level) user.level = level;

    await user.save();
    res.json({ msg: 'User berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /users/:id - hapus user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User tidak ditemukan' });
    res.json({ msg: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
