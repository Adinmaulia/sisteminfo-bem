// backend/models/Dokumen.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema untuk Koleksi Dokumen
const DokumenSchema = new Schema({
  jenisDokumen: {
    type: String,
    enum: ['suratMasuk', 'suratKeluar', 'lpjKegiatan'],
    required: true
  },
  file: {
    type: Schema.Types.ObjectId,
    ref: 'fs.files', // referensi ke koleksi GridFS files
    required: true
  },
  nomorSurat: {
    type: String,
    required: false
  }
}, {
  timestamps: true // menambahkan createdAt & updatedAt otomatis
});

module.exports = mongoose.model('Dokumen', DokumenSchema);