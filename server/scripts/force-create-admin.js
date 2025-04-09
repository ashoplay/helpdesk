const { MongoClient } = require('mongodb');
const argon2 = require('argon2');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUri = process.env.MONGO_URI;

async function createDirectAdmin() {
  console.log('Starting direct admin creation process...'.yellow.bold);
  
  if (!mongoUri) {
    console.error('MONGO_URI not found in environment variables'.red);
    process.exit(1);
  }
  
  let client;
  try {
    // Connect directly to MongoDB
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB'.green);
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Check if admin exists and remove if it does
    const existingAdmin = await usersCollection.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      await usersCollection.deleteOne({ email: 'admin@example.com' });
      console.log('Existing admin user deleted'.yellow);
    }

    // Generate password hash using argon2
    const passwordHash = await argon2.hash('admin123', {
      type: argon2.argon2id,
      memoryCost: 2**16,
      timeCost: 3,
      parallelism: 1
    });

    // Create a new admin user directly in the database
    const now = new Date();
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'admin',
      createdAt: now
    };

    const result = await usersCollection.insertOne(adminUser);
    console.log('Admin user created successfully!'.green.bold);
    console.log('Admin ID:'.cyan, result.insertedId);
    console.log('Email:'.cyan, 'admin@example.com');
    console.log('Password:'.cyan, 'admin123');
    console.log('\nPlease try logging in now with these credentials'.yellow);
    
  } catch (error) {
    console.error('Error creating admin user:'.red.bold);
    console.error(error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed'.gray);
    }
  }
}

createDirectAdmin().catch(console.error).finally(() => process.exit(0));
