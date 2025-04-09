const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import the Ticket model
const Ticket = require('../models/Ticket');

console.log('Ticket Model Schema Details:'.yellow.bold);
console.log('--------------------------'.yellow);

// Function to inspect schema paths and their required values
const inspectSchema = (schema) => {
  const paths = schema.paths;
  
  console.log('Required fields:'.cyan);
  Object.keys(paths).forEach(path => {
    const pathConfig = paths[path];
    
    if (pathConfig.isRequired) {
      console.log(`- ${path}`.green);
    }
    
    // Log enum values if present
    if (pathConfig.enumValues && pathConfig.enumValues.length) {
      console.log(`  ${path} enum values: ${pathConfig.enumValues.join(', ')}`.magenta);
    }
  });
  
  console.log('\nAll schema paths:'.cyan);
  Object.keys(paths).forEach(path => {
    const pathConfig = paths[path];
    console.log(`- ${path}: ${pathConfig.instance}`.gray);
  });
};

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...'.green.bold);
    
    // Inspect the schema
    const schema = Ticket.schema;
    inspectSchema(schema);
    
    console.log('\nInspection complete. You can now update your seed script accordingly.'.green);
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection failed'.red.bold, err);
    process.exit(1);
  });
