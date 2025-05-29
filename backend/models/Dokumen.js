// backend/models/Dokumen.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema untuk Koleksi Dokumen
const DokumenSchema = new Schema({
  suratMasuk: {
    type: Schema.Types.ObjectId,
    ref: 'fs.files', // referensi ke koleksi GridFS files
    required: true
  },
  suratKeluar: {
    type: Schema.Types.ObjectId,
    ref: 'fs.files',
    required: true
  },
  lpjKegiatan: {
    type: Schema.Types.ObjectId,
    ref: 'fs.files',
    required: true
  }
}, {
  timestamps: true // menambahkan createdAt & updatedAt otomatis
});

module.exports = mongoose.model('Dokumen', DokumenSchema);