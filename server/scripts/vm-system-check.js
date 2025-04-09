const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const colors = require('colors');
const net = require('net');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Function to check if port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is not in use
    });
    server.listen(port);
  });
};

// Check MongoDB connection
const checkDbConnection = async () => {
  try {
    console.log('Checking database connection to MongoDB at 10.12.49.35...'.yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Database connection successful'.green);
    mongoose.connection.close();
    return true;
  } catch (err) {
    console.error('✗ Database connection failed'.red);
    console.error(`Error: ${err.message}`);
    return false;
  }
};

// Check network connectivity
const checkNetworkConnectivity = () => {
  console.log('Checking network configuration...'.yellow);
  
  const { exec } = require('child_process');
  exec('ip addr show', (error, stdout, stderr) => {
    if (error) {
      console.error('✗ Could not check network configuration'.red);
      return;
    }
    console.log('Network interfaces:'.cyan);
    console.log(stdout);
    
    // Check if we can ping the gateway
    exec('ping -c 4 10.12.49.1', (error, stdout, stderr) => {
      if (error) {
        console.error('✗ Could not reach gateway 10.12.49.1'.red);
        return;
      }
      console.log('✓ Gateway 10.12.49.1 is reachable'.green);
    });
  });
};

// Main function
const runChecks = async () => {
  console.log('Running system checks for VM deployment...'.yellow.bold);
  
  // Check network
  checkNetworkConnectivity();
  
  // Check database
  await checkDbConnection();
  
  console.log('\nChecks completed. Verify that all checks passed before proceeding.'.cyan);
};

runChecks();
