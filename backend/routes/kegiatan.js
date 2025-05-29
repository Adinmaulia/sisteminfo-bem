const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Kegiatan = require('../models/Kegiatan');
const authMiddleware = require('../middleware/auth');

// helper: instance GridFSBucket
function getBucket() {
  const conn = mongoose.connection;
  return new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'fs' });
}

// PUBLIC ROUTES
// GET all kegiatan
router.get('/', async (req, res) => {
  try {
    const list = await Kegiatan.find().sort('-createdAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET single kegiatan by id
router.get('/:id', async (req, res) => {
  try {
    const item = await Kegiatan.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Kegiatan tidak ditemukan' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// stream dokumentasi file
router.get('/:id/dokumentasi', async (req, res) => {
  try {
    const item = await Kegiatan.findById(req.params.id);
    if (!item) return res.status(404).end();
    const bucket = getBucket();
    const files = await bucket.find({ _id: item.dokumentasi }).toArray();
    if (!files.length) return res.status(404).end();
    res.set('Content-Type', files[0].contentType);
    res.set('Access-Control-Allow-Origin', '*');
    bucket.openDownloadStream(item.dokumentasi).pipe(res);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PROTECTED: only admin
router.use(authMiddleware('admin'));

router.post('/', async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;
    if (!req.files || !req.files.dokumentasi) return res.status(400).json({ msg: 'File dokumentasi wajib diupload' });
    const file = req.files.dokumentasi;
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(file.name, { contentType: file.mimetype });
    uploadStream.end(file.data);
    uploadStream.on('finish', async () => {
      const newItem = new Kegiatan({ judul, dokumentasi: uploadStream.id, deskripsi });
      await newItem.save();
      res.status(201).json({ msg: 'Kegiatan berhasil dibuat', kegiatan: newItem });
    });
    uploadStream.on('error', () => res.status(500).json({ msg: 'Gagal upload file' }));
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;
    const item = await Kegiatan.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Kegiatan tidak ditemukan' });

    item.judul = judul;
    item.deskripsi = deskripsi;

    if (req.files && req.files.dokumentasi) {
      const bucket = getBucket();

      if (item.dokumentasi) {
        bucket.delete(item.dokumentasi, (err) => {
          if (err) console.error('Error deleting old dokumentasi:', err);
        });
      }

      const file = req.files.dokumentasi;
      const uploadStream = bucket.openUploadStream(file.name, { contentType: file.mimetype });
      uploadStream.end(file.data);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          item.dokumentasi = uploadStream.id;
          resolve();
        });
        uploadStream.on('error', (err) => {
          reject(err);
        });
      });
    }

    await item.save();
    res.json({ msg: 'Kegiatan berhasil diperbarui', kegiatan: item });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE remove kegiatan + file
router.delete('/:id', async (req, res) => {
  try {
    const item = await Kegiatan.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Kegiatan tidak ditemukan' });
    const bucket = getBucket();
    bucket.delete(item.dokumentasi, () => {});
    res.json({ msg: 'Kegiatan dan dokumentasi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
