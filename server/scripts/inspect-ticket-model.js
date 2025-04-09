const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import the Ticket model
const Ticket = require('../models/Ticket');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...'.green.bold);
    
    // Get the schema for direct inspection
    const ticketSchema = Ticket.schema;
    
    // Print out the exact enum values for status
    const statusPath = ticketSchema.path('status');
    console.log('\nStatus enum values:'.cyan.bold);
    if (statusPath && statusPath.enumValues) {
      statusPath.enumValues.forEach((value, index) => {
        console.log(`  ${index + 1}. '${value}'`.yellow);
      });
    }
    
    // Print out the exact enum values for priority
    const priorityPath = ticketSchema.path('priority');
    console.log('\nPriority enum values:'.cyan.bold);
    if (priorityPath && priorityPath.enumValues) {
      priorityPath.enumValues.forEach((value, index) => {
        console.log(`  ${index + 1}. '${value}'`.yellow);
      });
    }
    
    // Print out the exact enum values for type if it exists
    const typePath = ticketSchema.path('type');
    console.log('\nType enum values:'.cyan.bold);
    if (typePath && typePath.enumValues) {
      typePath.enumValues.forEach((value, index) => {
        console.log(`  ${index + 1}. '${value}'`.yellow);
      });
    }
    
    console.log('\nInspection complete. Use these exact values in your seed script.'.green);
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection failed'.red.bold, err);
    process.exit(1);
  });
