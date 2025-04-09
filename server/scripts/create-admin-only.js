const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');
const argon2 = require('argon2');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import the User model
const User = require('../models/User');

const createAdmin = async () => {
  try {
    console.log('Connecting to the database...'.yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected'.green);
    
    console.log('Checking if admin user exists...'.yellow);
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, deleting...'.yellow);
      await User.deleteOne({ email: 'admin@example.com' });
    }
    
    console.log('Creating new admin user...'.yellow);
    // Use direct password without pre-save hook to ensure clean creation
    const hashedPassword = await argon2.hash('admin123');
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Admin user created successfully!'.green.bold);
    console.log('Email:'.cyan, 'admin@example.com');
    console.log('Password:'.cyan, 'admin123');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:'.red, error);
    process.exit(1);
  }
};

createAdmin();
