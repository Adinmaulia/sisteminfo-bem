// backend/models/Kegiatan.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema untuk Kegiatan
const KegiatanSchema = new Schema({
  judul: {
    type: String,
    required: true,
    trim: true
  },
  dokumentasi: {
    type: Schema.Types.ObjectId,
    ref: 'fs.files', // referensi ke koleksi GridFS files
    required: true
  },
  deskripsi: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Kegiatan', KegiatanSchema);
