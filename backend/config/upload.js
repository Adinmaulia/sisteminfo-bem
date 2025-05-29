// backend/config/upload.js
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const mongoURI = 'mongodb://127.0.0.1:27017/node-data';

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: `foto_${Date.now()}_${file.originalname}`,
      bucketName: 'uploads', // Nama bucket GridFS
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
