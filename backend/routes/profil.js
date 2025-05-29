const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Profil = require('../models/Profil');
const authMiddleware = require('../middleware/auth');

// helper: dapatkan instance GridFSBucket
function getBucket() {
  const conn = mongoose.connection;
  return new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'fs'
  });
}

// GET /api/profil → list semua profil
router.get('/', async (req, res) => {
  try {
    // const profils = await Profil.find().sort('-updatedAt');
    const profils = await Profil.find().sort({ createdAt: 1 });
    res.json(profils);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/profil/:id        → detail satu profil (tanpa gambar)
router.get('/:id', async (req, res) => {
  try {
    const profil = await Profil.findById(req.params.id);
    if (!profil) return res.status(404).json({ msg: 'Profil tidak ditemukan' });
    res.json(profil);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/profil/:id/gambar → stream file gambar dari GridFS
// GET /api/profil/:id/gambar
router.get('/:id/gambar', async (req, res) => {
  const profil = await Profil.findById(req.params.id);
  if (!profil) return res.status(404).end();

  const bucket = getBucket();
  // cari metadata file
  const files = await bucket.find({ _id: profil.gambar }).toArray();
  if (!files || files.length === 0) return res.status(404).end();

  const fileInfo = files[0];
  res.set('Content-Type', fileInfo.contentType);
  res.set('Access-Control-Allow-Origin', '*');
  bucket.openDownloadStream(profil.gambar).pipe(res);
});


// Semua route di bawah ini hanya untuk admin
router.use(authMiddleware('admin'));

// POST /api/profil           → create profil baru (upload gambar + visi/misi)
router.post('/', async (req, res) => {
  try {
    // validasi
    const { visi, misi } = req.body;
    if (!req.files || !req.files.gambar) return res.status(400).json({ msg: 'Gambar wajib diupload' });

    // upload ke GridFS
    const file = req.files.gambar;
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.mimetype
    });
    uploadStream.end(file.data);

    uploadStream.on('finish', async () => {
      const newProfil = new Profil({
        gambar: uploadStream.id,
        visi,
        misi
      });
      await newProfil.save();
      res.status(201).json({ msg: 'Profil berhasil dibuat', profil: newProfil });
    });

    uploadStream.on('error', () => {
      res.status(500).json({ msg: 'Gagal upload gambar' });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/profil/:id        → update visi/misi dan ganti gambar jika ada
router.put('/:id', async (req, res) => {
  try {
    const { visi, misi } = req.body;
    const profil = await Profil.findById(req.params.id);
    if (!profil) return res.status(404).json({ msg: 'Profil tidak ditemukan' });

    profil.visi = visi;
    profil.misi = misi;

    if (req.files && req.files.gambar) {
      const bucket = getBucket();

      // Hapus file gambar lama
      if (profil.gambar) {
        bucket.delete(profil.gambar, (err) => {
          if (err) console.error('Error deleting old gambar:', err);
        });
      }

      // Upload file gambar baru
      const file = req.files.gambar;
      const uploadStream = bucket.openUploadStream(file.name, { contentType: file.mimetype });
      uploadStream.end(file.data);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          profil.gambar = uploadStream.id;
          resolve();
        });
        uploadStream.on('error', (err) => {
          reject(err);
        });
      });
    }

    await profil.save();
    res.json({ msg: 'Profil berhasil diperbarui', profil });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/profil/:id     → hapus profil + file di GridFS
router.delete('/:id', async (req, res) => {
  try {
    const profil = await Profil.findByIdAndDelete(req.params.id);
    if (!profil) return res.status(404).json({ msg: 'Profil tidak ditemukan' });

    // juga hapus file gambar di GridFS
    const bucket = getBucket();
    bucket.delete(profil.gambar, err => {
      // kita abaikan error delete file
      res.json({ msg: 'Profil dan gambarnya berhasil dihapus' });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
