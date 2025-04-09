const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const argon2 = require('argon2');
const path = require('path');

// Load env vars - fixed path to point to root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check if essential env vars are available
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is missing'.red.bold);
  console.log('Make sure you have a .env file in the project root with MONGO_URI defined'.yellow);
  process.exit(1);
}

// Import models
const User = require('../models/User');
const Company = require('../models/Company');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'.green.bold))
  .catch(err => {
    console.error('Failed to connect to MongoDB'.red.bold, err);
    process.exit(1);
  });

// Sample data
const companies = [
  {
    name: 'TechCorp',
    description: 'A leading technology company',
    industry: 'Technology',
    website: 'https://techcorp.example.com',
    address: '123 Tech St, Silicon Valley, CA'
  },
  {
    name: 'MediCare',
    description: 'Healthcare provider',
    industry: 'Healthcare',
    website: 'https://medicare.example.com',
    address: '456 Health Ave, Boston, MA'
  },
  {
    name: 'EduLearn',
    description: 'Educational institution',
    industry: 'Education',
    website: 'https://edulearn.example.com',
    address: '789 School Rd, Cambridge, MA'
  }
];

// Sample statuses and priorities for tickets
const statuses = ['åpen', 'pågår', 'venter på bruker', 'løst', 'avsluttet'];
const priorities = ['lav', 'normal', 'høy', 'kritisk'];
const ticketTypes = ['feil', 'forespørsel', 'spørsmål', 'hendelse'];
const categories = ['Hardware', 'Software', 'Network', 'Account', 'Email', 'Other'];

// Function to create users
const createUsers = async (companies) => {
  try {
    console.log('Creating users...'.yellow);
    
    // Create admin user
    const adminPassword = await argon2.hash('admin123');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('Admin user created'.green);
    
    // Create support users
    const supportUsers = [];
    
    // First line support
    const firstLinePassword = await argon2.hash('support123');
    const firstLine = await User.create({
      name: 'First Line Support',
      email: 'firstline@example.com',
      password: firstLinePassword,
      role: '1. linje'
    });
    supportUsers.push(firstLine);
    
    // Second line support
    const secondLinePassword = await argon2.hash('support123');
    const secondLine = await User.create({
      name: 'Second Line Support',
      email: 'secondline@example.com',
      password: secondLinePassword,
      role: '2. linje'
    });
    supportUsers.push(secondLine);
    
    console.log('Support users created'.green);
    
    // Create regular users for each company
    const regularUsers = [];
    for (const company of companies) {
      // Create 2 users per company
      for (let i = 1; i <= 2; i++) {
        const password = await argon2.hash('user123');
        const user = await User.create({
          name: `${company.name} User ${i}`,
          email: `user${i}@${company.name.toLowerCase()}.example.com`.replace(' ', ''),
          password: password,
          role: 'bruker',
          company: company._id
        });
        regularUsers.push(user);
      }
    }
    console.log(`${regularUsers.length} regular users created`.green);
    
    return { admin, supportUsers, regularUsers };
  } catch (error) {
    console.error('Error creating users:'.red, error);
    throw error;
  }
};

// Function to create tickets
const createTickets = async (users, companies) => {
  try {
    console.log('Creating tickets...'.yellow);
    
    const tickets = [];
    const regularUsers = users.regularUsers;
    const supportUsers = users.supportUsers;
    
    // Create tickets from regular users
    for (const user of regularUsers) {
      // Each user creates 1-3 tickets
      const numTickets = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numTickets; i++) {
        // Randomly determine if ticket will be assigned
        const isAssigned = Math.random() > 0.3;
        const assignedToRole = isAssigned ? 
          (Math.random() > 0.5 ? '1. linje' : '2. linje') : 
          'unassigned';
        
        const assignedUser = assignedToRole === '1. linje' ? 
          supportUsers[0] : 
          (assignedToRole === '2. linje' ? supportUsers[1] : null);
        
        // Random ticket details
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Create ticket
        const ticket = await Ticket.create({
          title: `${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)}: ${generateRandomTitle()}`,
          description: generateRandomDescription(ticketType),
          status: status,
          priority: priority,
          type: ticketType,
          category: category,  // Add category field
          createdBy: user._id,
          assignedToRole: assignedToRole,
          assignedTo: assignedUser ? assignedUser._id : null,
          company: user.company
        });
        
        tickets.push(ticket);
        
        // Add comments to some tickets
        if (Math.random() > 0.5) {
          const numComments = Math.floor(Math.random() * 3) + 1;
          
          for (let j = 0; j < numComments; j++) {
            // Randomly pick who's commenting
            const commentUser = Math.random() > 0.5 ? 
              user._id : 
              (assignedUser ? assignedUser._id : supportUsers[Math.floor(Math.random() * supportUsers.length)]._id);
            
            await Comment.create({
              text: generateRandomComment(),
              ticket: ticket._id,
              user: commentUser
            });
          }
        }
        
        // Add feedback to resolved tickets
        if (status === 'løst' && Math.random() > 0.3) {
          const rating = Math.floor(Math.random() * 5) + 1;
          const hasComment = Math.random() > 0.5;
          
          await Ticket.findByIdAndUpdate(ticket._id, {
            feedback: {
              rating: rating,
              comment: hasComment ? generateRandomFeedback(rating) : '',
              submittedAt: Date.now()
            }
          });
        }
      }
    }
    
    console.log(`${tickets.length} tickets created`.green);
    return tickets;
  } catch (error) {
    console.error('Error creating tickets:'.red, error);
    throw error;
  }
};

// Helper functions for generating random content
function generateRandomTitle() {
  const titles = [
    'Can\'t log in to my account',
    'Need help with printer setup',
    'Software not responding',
    'Request for new laptop',
    'Network connectivity issues',
    'Email not working',
    'Password reset required',
    'Application crashes frequently',
    'Lost access to shared folder',
    'Unable to connect to VPN'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRandomDescription(type) {
  const descriptions = {
    'feil': [
      'I\'m getting an error message whenever I try to use this application. It says "Error code 500: Internal server error".',
      'My computer keeps shutting down randomly during the day. No error message appears before it shuts down.',
      'Can\'t print any documents, the printer shows a paper jam but there\'s no paper stuck.'
    ],
    'forespørsel': [
      'I need access to the marketing department\'s shared drive for an upcoming project.',
      'Could you please install the latest version of Adobe Creative Suite on my workstation?',
      'I\'m starting a new role and need all the standard software setup on my computer.'
    ],
    'spørsmål': [
      'How do I set up email forwarding when I\'m out of office?',
      'What\'s the process for requesting additional hardware for my team?',
      'Where can I find the company\'s IT policy documents?'
    ],
    'hendelse': [
      'The office wifi network is down, affecting everyone in the building.',
      'The main website is returning a 404 error for all visitors.',
      'The phone system isn\'t working for incoming calls.'
    ]
  };
  
  const typeDescriptions = descriptions[type] || descriptions['feil'];
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
}

function generateRandomComment() {
  const comments = [
    'I\'ve checked this issue and I\'m working on a solution.',
    'Could you provide more details about when this started happening?',
    'Have you tried restarting your computer?',
    'This is a known issue and we\'re working on a fix.',
    'I\'ve escalated this to our specialist team.',
    'The issue should be resolved now.',
    'I\'ve updated the ticket with the latest information.',
    'We need more information to proceed with this request.'
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

function generateRandomFeedback(rating) {
  const goodFeedback = [
    'Great service, very quick response!',
    'Support person was very helpful and knowledgeable.',
    'Problem was solved perfectly.',
    'Very satisfied with the help I received.'
  ];
  
  const badFeedback = [
    'Took too long to resolve my issue.',
    'The solution didn\'t fully fix my problem.',
    'Communication could have been better.',
    'Had to explain my issue multiple times.'
  ];
  
  return rating >= 4 ? 
    goodFeedback[Math.floor(Math.random() * goodFeedback.length)] : 
    badFeedback[Math.floor(Math.random() * badFeedback.length)];
}

// Main function to seed data
const seedData = async () => {
  try {
    // Clean existing data
    console.log('Cleaning existing data...'.yellow);
    await Comment.deleteMany({});
    await Ticket.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('Database cleaned'.green);
    
    // Seed companies
    console.log('Creating companies...'.yellow);
    const createdCompanies = await Company.insertMany(companies);
    console.log(`${createdCompanies.length} companies created`.green);
    
    // Seed users
    const users = await createUsers(createdCompanies);
    
    // Seed tickets and comments
    const tickets = await createTickets(users, createdCompanies);
    
    console.log('Demo data seeded successfully!'.green.bold);
    console.log('\nYou can now log in with:'.cyan);
    console.log('Admin:'.bold, 'admin@example.com / admin123');
    console.log('Support:'.bold, 'firstline@example.com / support123');
    console.log('         secondline@example.com / support123');
    console.log('Users:'.bold, 'user1@techcorp.example.com / user123');
    console.log('       (and others, check the database for details)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:'.red.bold, error);
    process.exit(1);
  }
};

// Run the seeding
seedData();