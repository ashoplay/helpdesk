const http = require('http');
const colors = require('colors');

const isServerRunning = (port = 5000) => {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'HEAD',
      hostname: 'localhost',
      port: port,
      path: '/',
      timeout: 2000
    }, (res) => {
      resolve(true); // Server responded
    });
    
    req.on('error', () => {
      resolve(false); // Server not responding
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false); // Request timed out
    });
    
    req.end();
  });
};

async function checkStatus() {
  console.log('Checking server status...'.yellow);
  
  const isRunning = await isServerRunning();
  
  if (isRunning) {
    console.log('✅ SERVER IS RUNNING'.green.bold);
    console.log('The API server is running on port 5000.'.green);
  } else {
    console.log('❌ SERVER IS NOT RUNNING'.red.bold);
    console.log('The API server is not running. Start it with:'.yellow);
    console.log('npm run server'.cyan);
  }
}

checkStatus();
