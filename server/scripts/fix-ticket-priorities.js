const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import the Ticket model
const Ticket = require('../models/Ticket');

const fixTicketPriorities = async () => {
  try {
    console.log('Connecting to MongoDB...'.yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB'.green);

    // First, display the schema details
    const schema = Ticket.schema;
    const priorityPath = schema.path('priority');
    
    console.log('\nTicket Priority Schema:'.cyan.bold);
    console.log('Type:'.green, priorityPath.instance);
    
    if (priorityPath.enumValues) {
      console.log('Valid values:'.green, priorityPath.enumValues);
      
      // Get all tickets
      const tickets = await Ticket.find();
      console.log(`\nFound ${tickets.length} tickets in database`.yellow);
      
      // Check current priority values in database
      const priorityValues = new Set();
      tickets.forEach(ticket => {
        priorityValues.add(ticket.priority);
      });
      
      console.log('Current priority values in use:'.green, Array.from(priorityValues));
      
      // Find tickets with invalid priorities
      const invalidTickets = tickets.filter(ticket => {
        return !priorityPath.enumValues.includes(ticket.priority);
      });
      
      if (invalidTickets.length > 0) {
        console.log(`\n${invalidTickets.length} tickets have invalid priority values:`.red);
        
        // Show which values are causing issues
        const invalidValues = new Set();
        invalidTickets.forEach(ticket => {
          invalidValues.add(ticket.priority);
        });
        
        console.log('Invalid priority values:'.red, Array.from(invalidValues));
        
        // Ask for confirmation to fix
        console.log('\nWould you like to fix these tickets? Press enter to continue or Ctrl+C to abort'.cyan);
        await new Promise(resolve => {
          process.stdin.once('data', () => resolve());
        });
        
        // Map invalid values to valid ones
        const valueMapping = {
          'medium': 'normal',  // Most likely issue
          'Medium': 'normal',
          'HIGH': 'høy',
          'high': 'høy',
          'High': 'høy',
          'LOW': 'lav',
          'low': 'lav',
          'Low': 'lav',
          'CRITICAL': 'kritisk',
          'critical': 'kritisk',
          'Critical': 'kritisk'
        };
        
        // Fix invalid tickets
        let fixedCount = 0;
        for (const ticket of invalidTickets) {
          const oldValue = ticket.priority;
          const newValue = valueMapping[oldValue] || 'normal'; // Default to normal if no mapping
          
          await Ticket.updateOne(
            { _id: ticket._id },
            { $set: { priority: newValue } }
          );
          
          fixedCount++;
          console.log(`Fixed ticket ${ticket._id}: ${oldValue} -> ${newValue}`.green);
        }
        
        console.log(`\n✅ Fixed ${fixedCount} tickets successfully!`.green.bold);
      } else {
        console.log('\n✅ All tickets have valid priority values.'.green.bold);
      }
      
      // Show the valid enum values for easy reference in UI
      console.log('\nFor reference, here are the valid enum values to use in your UI:'.cyan);
      priorityPath.enumValues.forEach((value, index) => {
        console.log(`${index + 1}. '${value}'`.yellow);
      });
    } else {
      console.log('No enum values defined for priority'.red);
    }
  } catch (error) {
    console.error('Error:'.red, error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB'.gray);
  }
};

fixTicketPriorities().catch(console.error);
