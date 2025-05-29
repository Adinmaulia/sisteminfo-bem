// routes/pengurus.js
const express = require('express');
const router = express.Router();
const Pengurus = require('../models/Pengurus');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware untuk proteksi route hanya untuk admin
// router.use(authMiddleware('admin'));

// GET /pengurus - dapatkan semua pengurus
router.get('/', async (req, res) => {
  try {
    const pengurus = await Pengurus.find();
    res.json(pengurus);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /pengurus/:id - dapatkan pengurus berdasarkan id
router.get('/:id', async (req, res) => {
  try {
    const pengurus = await Pengurus.findById(req.params.id);
    if (!pengurus) return res.status(404).json({ msg: 'Pengurus tidak ditemukan' });
    res.json(pengurus);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PROTECTED: only admin
router.use(authMiddleware('admin'));

// POST /pengurus - buat pengurus baru
router.post(
  '/',
  [
    body('jabatan').notEmpty().withMessage('Jabatan wajib diisi'),
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('nim').notEmpty().withMessage('NIM wajib diisi'),
    body('jurusan').notEmpty().withMessage('Jurusan wajib diisi'),
    body('periode').notEmpty().withMessage('Periode wajib diisi'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { jabatan, nama, nim, jurusan, periode } = req.body;
    try {
      const existing = await Pengurus.findOne({ nim });
      if (existing) return res.status(400).json({ msg: 'NIM sudah digunakan' });

      const newPengurus = new Pengurus({ jabatan, nama, nim, jurusan, periode });
      await newPengurus.save();
      res.status(201).json({ msg: 'Pengurus berhasil dibuat' });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// PUT /pengurus/:id - update pengurus
router.put(
  '/:id',
  [
    body('jabatan').notEmpty().withMessage('Jabatan wajib diisi'),
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('nim').notEmpty().withMessage('NIM wajib diisi'),
    body('jurusan').notEmpty().withMessage('Jurusan wajib diisi'),
    body('periode').notEmpty().withMessage('Periode wajib diisi'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { jabatan, nama, nim, jurusan, periode } = req.body;
    try {
      const pengurus = await Pengurus.findById(req.params.id);
      if (!pengurus) return res.status(404).json({ msg: 'Pengurus tidak ditemukan' });

      // Cek jika nim diupdate dan sudah ada di data lain
      if (nim !== pengurus.nim) {
        const existing = await Pengurus.findOne({ nim });
        if (existing) return res.status(400).json({ msg: 'NIM sudah digunakan' });
      }

      pengurus.jabatan = jabatan;
      pengurus.nama = nama;
      pengurus.nim = nim;
      pengurus.jurusan = jurusan;
      pengurus.periode = periode;

      await pengurus.save();
      res.json({ msg: 'Pengurus berhasil diperbarui' });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// DELETE /pengurus/:id - hapus pengurus
router.delete('/:id', async (req, res) => {
  try {
    const pengurus = await Pengurus.findByIdAndDelete(req.params.id);
    if (!pengurus) return res.status(404).json({ msg: 'Pengurus tidak ditemukan' });
    res.json({ msg: 'Pengurus berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
