// backend/models/Profil.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema untuk Profil
const ProfilSchema = new Schema({
  gambar: {
    type: Schema.Types.ObjectId,
    ref: 'fs.files', // referensi ke koleksi GridFS files
    required: true
  },
  visi: {
    type: String,
    required: true,
    trim: true
  },
  misi: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profil', ProfilSchema);
