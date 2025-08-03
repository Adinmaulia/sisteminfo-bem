// ====== backend/routes/dokumen.js ======
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Dokumen = require('../models/Dokumen');
const authMiddleware = require('../middleware/auth');

// helper: GridFSBucket instance
function getBucket() {
    const conn = mongoose.connection;
    return new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'fs' });
}

// PUBLIC: list semua dokumen dengan nama file
router.get('/', async (req, res) => {
    try {
        const docs = await Dokumen.find().sort('-createdAt');
        const bucket = getBucket();

        const hasil = await Promise.all(
            docs.map(async d => {
                const files = await bucket.find({ _id: d.file }).toArray();
                return {
                    ...d.toObject(),
                    fileName: files[0]?.filename || 'Unknown.pdf'
                };
            })
        );

        res.json(hasil);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUBLIC: stream PDF
router.get('/:id/pdf', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Dokumen.findById(id);
        if (!doc) return res.status(404).end();
        const fileId = doc.file;
        const bucket = getBucket();
        const files = await bucket.find({ _id: fileId }).toArray();
        if (!files.length) return res.status(404).end();
        res.set('Content-Type', 'application/pdf');
        res.set('Access-Control-Allow-Origin', '*');
        bucket.openDownloadStream(fileId).pipe(res);
        
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PROTECTED: admin only
router.use(authMiddleware('admin'));

// POST create new document
router.post('/', async (req, res) => {
    try {
        const { jenisDokumen, nomorSurat } = req.body;
        const file = req.files?.file;
        
        if (!file) return res.status(400).json({ msg: 'File PDF wajib diupload' });
        if (!jenisDokumen) return res.status(400).json({ msg: 'Jenis dokumen wajib diisi' });
        
        const bucket = getBucket();
        const upload = file => new Promise((resolve, reject) => {
            const stream = bucket.openUploadStream(file.name, { contentType: file.mimetype });
            stream.end(file.data);
            stream.on('finish', () => resolve(stream.id));
            stream.on('error', reject);
        });
        
        const fileId = await upload(file);
        const newDoc = new Dokumen({ 
            jenisDokumen,
            file: fileId,
            nomorSurat
        });
        
        await newDoc.save();
        res.status(201).json({ msg: 'Dokumen dibuat', doc: newDoc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update document
router.put('/:id', async (req, res) => {
    try {
        const doc = await Dokumen.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Dokumen tidak ditemukan' });
        
        const bucket = getBucket();
        
        // Update nomor surat jika ada di request body
        if (req.body.nomorSurat !== undefined) doc.nomorSurat = req.body.nomorSurat;
        
        // Update jenis dokumen jika ada
        if (req.body.jenisDokumen) doc.jenisDokumen = req.body.jenisDokumen;
        
        // Update file jika ada
        if (req.files && req.files.file) {
            // delete old file
            bucket.delete(doc.file, () => { });
            // upload new
            const file = req.files.file;
            const stream = bucket.openUploadStream(file.name, { contentType: file.mimetype });
            stream.end(file.data);
            await new Promise(r => stream.on('finish', r));
            doc.file = stream.id;
        }
        
        await doc.save();
        res.json({ msg: 'Dokumen diperbarui', doc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE document + file
router.delete('/:id', async (req, res) => {
    try {
        const doc = await Dokumen.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Dokumen tidak ditemukan' });
        const bucket = getBucket();
        bucket.delete(doc.file, () => { });
        res.json({ msg: 'Dokumen dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
