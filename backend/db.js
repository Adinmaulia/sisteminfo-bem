// backend/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/sisteminfo-bem', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB berhasil terhubung');
        
        // Inisialisasi GridFSBucket untuk upload dan download file
        const connection = mongoose.connection;
        connection.once('open', () => {
            console.log("GridFS siap digunakan!");
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
