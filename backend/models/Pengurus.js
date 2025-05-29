const mongoose = require('mongoose');

// Schema untuk koleksi Pengurus
const PengurusSchema = new mongoose.Schema({
  jabatan: {
    type: String,
    required: true,
    trim: true
  },
  nama: {
    type: String,
    required: true,
    trim: true
  },
  nim: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  jurusan: {
    type: String,
    required: true,
    trim: true
  },
  periode: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // menambahkan createdAt & updatedAt otomatis
});

// Export model Pengurus
module.exports = mongoose.model('Pengurus', PengurusSchema);
