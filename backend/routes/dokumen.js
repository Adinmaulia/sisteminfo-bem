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
                const [inFile] = await bucket.find({ _id: d.suratMasuk }).toArray();
                const [outFile] = await bucket.find({ _id: d.suratKeluar }).toArray();
                const [lpjFile] = await bucket.find({ _id: d.lpjKegiatan }).toArray();
                return {
                    ...d.toObject(),
                    suratMasukName: inFile?.filename || 'Unknown.pdf',
                    suratKeluarName: outFile?.filename || 'Unknown.pdf',
                    lpjKegiatanName: lpjFile?.filename || 'Unknown.pdf'
                };
            })
        );

        res.json(hasil);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUBLIC: stream PDF field
router.get('/:id/pdf/:field', async (req, res) => {
    try {
        const { id, field } = req.params;
        if (!['suratMasuk', 'suratKeluar', 'lpjKegiatan'].includes(field)) return res.status(400).end();
        const doc = await Dokumen.findById(id);
        if (!doc) return res.status(404).end();
        const fileId = doc[field];
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

// GET all documents
// router.get('/', async (req, res) => {
//     try {
//         const list = await Dokumen.find().sort('-updatedAt');
//         res.json(list);
//     } catch {    
//         res.status(500).json({ msg: 'Server error' });
//     }
// });

// PROTECTED: admin only
router.use(authMiddleware('admin'));

// POST create new with 3 PDFs
router.post('/', async (req, res) => {
    try {
        const { suratMasuk, suratKeluar, lpjKegiatan } = req.files;
        if (!suratMasuk || !suratKeluar || !lpjKegiatan) return res.status(400).json({ msg: 'Semua file PDF wajib diupload' });
        const bucket = getBucket();
        const upload = file => new Promise((resolve, reject) => {
            const stream = bucket.openUploadStream(file.name, { contentType: file.mimetype });
            stream.end(file.data);
            stream.on('finish', () => resolve(stream.id));
            stream.on('error', reject);
        });
        const ids = await Promise.all([upload(suratMasuk), upload(suratKeluar), upload(lpjKegiatan)]);
        const newDoc = new Dokumen({ suratMasuk: ids[0], suratKeluar: ids[1], lpjKegiatan: ids[2] });
        await newDoc.save();
        res.status(201).json({ msg: 'Dokumen dibuat', doc: newDoc });
    } catch {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update description? no fields. But allow reupload any
router.put('/:id', async (req, res) => {
    try {
        const doc = await Dokumen.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Dokumen tidak ditemukan' });
        const bucket = getBucket();
        // optional reupload each
        for (const field of ['suratMasuk', 'suratKeluar', 'lpjKegiatan']) {
            if (req.files && req.files[field]) {
                // delete old file
                bucket.delete(doc[field], () => { });
                // upload new
                const file = req.files[field];
                const stream = bucket.openUploadStream(file.name, { contentType: file.mimetype });
                stream.end(file.data);
                await new Promise(r => stream.on('finish', r));
                doc[field] = stream.id;
            }
        }
        await doc.save();
        res.json({ msg: 'Dokumen diperbarui', doc });
    } catch {
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE document + files
router.delete('/:id', async (req, res) => {
    try {
        const doc = await Dokumen.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Dokumen tidak ditemukan' });
        const bucket = getBucket();
        [doc.suratMasuk, doc.suratKeluar, doc.lpjKegiatan].forEach(id => bucket.delete(id, () => { }));
        res.json({ msg: 'Dokumen dihapus' });
    } catch {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;