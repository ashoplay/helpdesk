const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');
const argon2 = require('argon2');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');

async function testAuth() {
  try {
    console.log('Connecting to MongoDB...'.yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB'.green);
    
    // Find the admin user
    console.log('Looking for admin user...'.yellow);
    const admin = await User.findOne({ email: 'admin@example.com' }).select('+password');
    
    if (!admin) {
      console.error('Admin user not found!'.red.bold);
      return;
    }
    
    console.log('Admin user found:'.green);
    console.log('  ID:'.cyan, admin._id);
    console.log('  Name:'.cyan, admin.name);
    console.log('  Email:'.cyan, admin.email);
    console.log('  Role:'.cyan, admin.role);
    
    // Test password match
    console.log('\nTesting password verification...'.yellow);
    
    // Print hashed password format (without showing the actual hash)
    console.log('Password hash type:'.cyan, typeof admin.password);
    console.log('Password hash starts with:'.cyan, admin.password.substring(0, 10) + '...');
    
    // Try to verify the password directly
    try {
      const isMatch = await argon2.verify(admin.password, 'admin123');
      console.log('Password verification result:'.cyan, isMatch ? 'SUCCESS ✓'.green.bold : 'FAILED ✗'.red.bold);
      
      if (!isMatch) {
        console.log('\nTrying direct password comparison:'.yellow);
        console.log('Expected:'.gray, 'admin123');
        console.log('Trying to match with stored hash:'.gray, admin.password.substring(0, 10) + '...');
      }
    } catch (error) {
      console.error('Error during password verification:'.red);
      console.error(error);
    }
    
    console.log('\nNOTE: If you continue to have issues, run the "force-admin" command'.cyan);
    
  } catch (error) {
    console.error('Error:'.red, error);
  } finally {
    await mongoose.disconnect();
  }
}

testAuth().catch(console.error).finally(() => process.exit(0));
