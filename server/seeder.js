const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create admin user
const createAdminUser = async () => {
  try {
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit();
    }

    const admin = await User.create(adminData);
    console.log(`Admin user created: ${admin.email}`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Delete all users (be careful with this in production!)
const deleteUsers = async () => {
  try {
    await User.deleteMany();
    console.log('All users deleted');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Process command line arguments
if (process.argv[2] === '-i') {
  createAdminUser();
} else if (process.argv[2] === '-d') {
  deleteUsers();
} else {
  console.log('Please provide valid command: node seeder -i (import) or -d (delete)');
  process.exit();
}
