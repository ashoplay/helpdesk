const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const colors = require('colors');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

// Load env vars - fixed path to point to root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check if essential env vars are available
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is missing'.red.bold);
  console.log('Make sure you have a .env file in the project root with MONGO_URI defined'.yellow);
  process.exit(1);
}

const baseUrl = process.env.API_URL || 'http://localhost:5000/api';
let authToken;
let testUserId;

// Function to check if a port is in use (server is running)
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use, server is likely running
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

// Function to check database connection
const checkDbConnection = async () => {
  try {
    console.log('Checking database connection...'.yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Database connection successful'.green);
    return true;
  } catch (err) {
    console.error('✗ Database connection failed'.red);
    console.error(err);
    return false;
  }
};

// Function to check API health
const checkApiHealth = async () => {
  try {
    console.log('Checking API health...'.yellow);
    
    // First check if server is running
    const port = process.env.PORT || 5000;
    const serverRunning = await isPortInUse(port);
    
    if (!serverRunning) {
      console.error('✗ API health check failed: Server is not running'.red);
      console.log('Please start the server with "npm run server" in another terminal window'.yellow);
      return false;
    }
    
    const response = await axios.get(`${baseUrl}/auth/health`);
    if (response.data.success) {
      console.log('✓ API health check passed'.green);
      return true;
    }
    console.error('✗ API health check failed: Endpoint returned unexpected response'.red);
    return false;
  } catch (err) {
    console.error('✗ API health check failed'.red);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('  The server is not responding. Make sure it\'s running on port 5000.'.yellow);
      console.log('  Run "npm run server" in a separate terminal window, then try again.'.cyan);
    } else {
      console.error(`  Error: ${err.message}`);
    }
    
    return false;
  }
};

// Function to test authentication
const testAuthentication = async () => {
  try {
    console.log('Testing authentication...'.yellow);
    
    // Try to log in with admin credentials
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('✓ Authentication successful'.green);
      
      // Test getting user profile
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const profileResponse = await axios.get(`${baseUrl}/auth/me`, config);
      
      if (profileResponse.data.success && profileResponse.data.data) {
        console.log('✓ User profile retrieval successful'.green);
        return true;
      }
    }
    
    console.error('✗ Authentication test failed'.red);
    console.log('  Make sure you have created an admin user with "npm run create-admin" or "npm run seed-demo"'.yellow);
    return false;
  } catch (err) {
    console.error('✗ Authentication test failed'.red);
    if (err.response && err.response.status === 401) {
      console.error('  Invalid credentials. The admin user may not exist or has a different password.'.yellow);
      console.log('  Create an admin user with "npm run create-admin" or "npm run seed-demo"'.cyan);
    } else {
      console.error(`  Error: ${err.message}`);
    }
    return false;
  }
};

// Function to test ticket operations
const testTicketOperations = async () => {
  try {
    console.log('Testing ticket operations...'.yellow);
    
    // Skip if no auth token
    if (!authToken) {
      console.log('Skipping ticket operations (no auth token)'.yellow);
      return false;
    }
    
    const config = { headers: { Authorization: `Bearer ${authToken}` } };
    
    // Test ticket creation
    const newTicket = {
      title: 'Test ticket',
      description: 'This is a test ticket created by system check',
      priority: 'medium',
      status: 'open'
    };
    
    const createResponse = await axios.post(`${baseUrl}/tickets`, newTicket, config);
    
    if (createResponse.data.success && createResponse.data.data) {
      const ticketId = createResponse.data.data._id;
      console.log(`✓ Ticket creation successful (id: ${ticketId})`.green);
      
      // Test ticket retrieval
      const getResponse = await axios.get(`${baseUrl}/tickets/${ticketId}`, config);
      
      if (getResponse.data.success) {
        console.log('✓ Ticket retrieval successful'.green);
        
        // Test ticket update
        const updateResponse = await axios.put(
          `${baseUrl}/tickets/${ticketId}`,
          { status: 'in progress' },
          config
        );
        
        if (updateResponse.data.success) {
          console.log('✓ Ticket update successful'.green);
          
          // Test ticket deletion
          const deleteResponse = await axios.delete(
            `${baseUrl}/tickets/${ticketId}`,
            config
          );
          
          if (deleteResponse.data.success) {
            console.log('✓ Ticket deletion successful'.green);
            return true;
          }
        }
      }
    }
    
    console.error('✗ Ticket operations test failed'.red);
    return false;
  } catch (err) {
    console.error('✗ Ticket operations test failed'.red);
    console.error(err.message);
    return false;
  }
};

// Main function to run all checks
const runSystemCheck = async () => {
  console.log('=== STARTING SYSTEM CHECK ==='.cyan.bold);
  
  const dbConnected = await checkDbConnection();
  
  if (!dbConnected) {
    console.log('System check failed: Database connection issue'.red.bold);
    process.exit(1);
  }
  
  // Check if server is running before other tests
  const apiHealth = await checkApiHealth();
  
  if (!apiHealth) {
    console.log('\n=== SYSTEM CHECK RESULTS ==='.cyan.bold);
    console.log(`Database Connection: ${dbConnected ? '✓'.green : '✗'.red}`);
    console.log(`API Health: ${apiHealth ? '✓'.green : '✗'.red}`);
    console.log('\n❌ SYSTEM CHECK FAILED: Server is not running correctly'.red.bold);
    console.log('\nTry the following:'.yellow);
    console.log('1. Make sure MongoDB is running');
    console.log('2. Start the server with "npm run server" in a separate terminal');
    console.log('3. Run this check again in another terminal with "npm run check-system"');
    process.exit(1);
  }
  
  const authWorks = await testAuthentication();
  const ticketsWork = await testTicketOperations();
  
  // Disconnect from DB
  await mongoose.disconnect();
  
  // Print results
  console.log('\n=== SYSTEM CHECK RESULTS ==='.cyan.bold);
  console.log(`Database Connection: ${dbConnected ? '✓'.green : '✗'.red}`);
  console.log(`API Health: ${apiHealth ? '✓'.green : '✗'.red}`);
  console.log(`Authentication: ${authWorks ? '✓'.green : '✗'.red}`);
  console.log(`Ticket Operations: ${ticketsWork ? '✓'.green : '✗'.red}`);
  
  // Overall result
  const allPassed = dbConnected && apiHealth && authWorks && ticketsWork;
  
  if (allPassed) {
    console.log('\n✅ SYSTEM CHECK PASSED: All components are working correctly'.green.bold);
  } else {
    console.log('\n❌ SYSTEM CHECK FAILED: Some components are not working correctly'.red.bold);
  }
};

// Run the system check
runSystemCheck().catch(err => {
  console.error('Unhandled error during system check:'.red, err);
  process.exit(1);
});
