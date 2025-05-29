// backend/models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: String, required: true }
});
module.exports = mongoose.model('User', userSchema);
