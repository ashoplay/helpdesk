const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to check what's using a port
function checkPortUse(port) {
  console.log(`Checking what process is using port ${port}...`.yellow);
  
  try {
    // Different commands for different operating systems
    let command;
    if (process.platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -i :${port} | grep LISTEN`;
    }
    
    const output = execSync(command, { encoding: 'utf-8' });
    
    if (output) {
      console.log('\nPort usage information:'.cyan);
      console.log(output);
      
      // Extracting PID depends on OS
      let pid;
      if (process.platform === 'win32') {
        // On Windows, PID is typically the last column
        const lines = output.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const columns = lines[0].trim().split(/\s+/);
          pid = columns[columns.length - 1];
        }
      } else {
        // On Linux/Mac, we can parse the lsof output
        const match = output.match(/\S+\s+(\d+)/);
        pid = match ? match[1] : null;
      }
      
      if (pid) {
        console.log(`Process ID (PID) using port ${port}: ${pid}`.green);
        return pid;
      }
    }
    
    console.log(`No process found using port ${port}`.yellow);
    return null;
  } catch (error) {
    console.error(`Error checking port usage: ${error.message}`.red);
    return null;
  }
}

// Function to kill a process by PID
function killProcess(pid) {
  try {
    const command = process.platform === 'win32' 
      ? `taskkill /F /PID ${pid}` 
      : `kill -9 ${pid}`;
    
    execSync(command);
    console.log(`Successfully terminated process with PID ${pid}`.green);
    return true;
  } catch (error) {
    console.error(`Failed to kill process: ${error.message}`.red);
    return false;
  }
}

// Function to update the port in .env file
function updateEnvPort(newPort) {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Check if PORT is already defined
    if (envContent.includes('PORT=')) {
      // Replace existing PORT
      envContent = envContent.replace(/PORT=\d+/g, `PORT=${newPort}`);
    } else {
      // Add PORT to env file
      envContent += `\nPORT=${newPort}`;
    }
    
    fs.writeFileSync(envPath, envContent.trim());
    console.log(`Updated .env file with PORT=${newPort}`.green);
    return true;
  } catch (error) {
    console.error(`Failed to update .env file: ${error.message}`.red);
    return false;
  }
}

// Main function to resolve port conflict
async function resolvePortConflict() {
  console.log('\n=== Port Conflict Resolution Tool ==='.cyan.bold);
  
  const currentPort = process.env.PORT || 5000;
  console.log(`Current port configuration: ${currentPort}`.yellow);
  
  const pid = checkPortUse(currentPort);
  
  if (!pid) {
    console.log('\nCould not identify the process using the port.'.yellow);
    console.log('The port may be temporarily in use or there might be a network issue.'.yellow);
  }
  
  console.log('\nOptions to resolve the conflict:'.cyan);
  console.log('1. Kill the process using the port');
  console.log('2. Use a different port');
  console.log('3. Exit');
  
  rl.question('\nEnter your choice (1-3): ', async (choice) => {
    switch (choice) {
      case '1':
        if (pid) {
          if (killProcess(pid)) {
            console.log('\nYou can now start your server with:'.green);
            console.log('npm run server'.yellow);
          }
        } else {
          console.log('No process ID found to kill.'.red);
        }
        break;
        
      case '2':
        rl.question('Enter new port number (e.g., 5001): ', async (newPort) => {
          if (isNaN(newPort) || newPort < 1024 || newPort > 65535) {
            console.log('Invalid port number. Please use a number between 1024 and 65535.'.red);
          } else {
            if (updateEnvPort(newPort)) {
              console.log('\nYou can now start your server with:'.green);
              console.log('npm run server'.yellow);
              console.log(`The server will now run on port ${newPort}`.cyan);
              console.log(`Access your application at: http://localhost:${newPort}`.cyan);
            }
          }
          rl.close();
        });
        return; // Don't close rl yet
        
      case '3':
        console.log('Exiting without changes.'.yellow);
        break;
        
      default:
        console.log('Invalid choice.'.red);
    }
    
    rl.close();
  });
}

// Start the conflict resolution process
resolvePortConflict();
