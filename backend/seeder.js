// seeder.js  (run with `node seeder.js`)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

require('dotenv').config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Admin.findOne({ username: 'admin' });
  if (!existing) {
    const hash = await bcrypt.hash('adminpassword', 10);
    await Admin.create({ username: 'admin', password: hash });
    console.log('Admin user created');
  } else console.log('Admin already exists');
  process.exit();
}
seedAdmin();