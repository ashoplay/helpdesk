const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Comment = require('./models/Comment');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample tickets and responses
const sampleTickets = [
  {
    title: 'Cannot access company email',
    description: 'Since this morning, I have been unable to log into my company email account. It keeps saying "authentication failed" even though I\'m using the correct password.',
    category: 'Account',
    status: 'Løst',
    priority: 'Høy',
    assignedToRole: '1. linje',
    responses: [
      {
        content: 'Thank you for reporting this issue. Can you please try clearing your browser cache and cookies, then try logging in again? Also, please confirm if you can access other company systems.',
        role: '1. linje'
      },
      {
        content: 'I cleared my cache and cookies as suggested, but still cannot access my email. I can log into other company systems without issues.',
        role: 'user'
      },
      {
        content: 'Thank you for confirming. We\'ve identified an authentication issue affecting some email accounts. Our team has reset your account credentials. Please check your mobile phone for an SMS with temporary login details and instructions to set a new password.',
        role: '1. linje'
      },
      {
        content: 'The temporary credentials worked, and I\'ve successfully set a new password. I can now access my email. Thank you for your help!',
        role: 'user'
      }
    ]
  },
  {
    title: 'Software installation error',
    description: 'I\'m trying to install the new accounting software as instructed in the company memo, but I keep getting an error message saying "Error 1603: A fatal error occurred during installation".',
    category: 'Software',
    status: 'Løst',
    priority: 'Medium',
    assignedToRole: '1. linje',
    responses: [
      {
        content: 'Thank you for your ticket. Error 1603 typically indicates an issue with Windows Installer. First, please try rebooting your computer and attempting the installation again. If that doesn\'t work, could you please tell us which version of Windows you\'re running?',
        role: '1. linje'
      },
      {
        content: 'I rebooted and tried again, but still get the same error. I\'m running Windows 10 Pro, version 21H2.',
        role: 'user'
      },
      {
        content: 'Thank you for the information. I\'ve prepared a troubleshooting script that will fix common installation issues. You\'ll receive an email with a link to download it. Please run the script with administrator privileges and then try the installation again.',
        role: '1. linje'
      },
      {
        content: 'I ran the script and attempted the installation again. It worked! The software is now installed and running properly. Thanks for your help.',
        role: 'user'
      }
    ]
  },
  {
    title: 'Network connectivity issues in meeting room B',
    description: 'We\'ve been experiencing intermittent Wi-Fi connectivity in meeting room B. Devices connect but keep losing internet access during meetings, which is causing problems during our video conferences.',
    category: 'Network',
    status: 'Løst',
    priority: 'Medium',
    assignedToRole: '2. linje',
    responses: [
      {
        content: 'Thank you for reporting this issue. I\'ll need some additional information: 1) How many devices typically connect in this room? 2) At what times do you notice the issue most? 3) Are other meeting rooms experiencing similar problems?',
        role: '1. linje'
      },
      {
        content: 'Usually about 5-8 devices connect during meetings. We notice the issue most during afternoon meetings (1-3 PM). Other meeting rooms seem fine, it\'s just room B that has this problem.',
        role: 'user'
      },
      {
        content: 'I\'m escalating this to our network specialist team as it appears to be a localized network issue that requires advanced troubleshooting.',
        role: '1. linje'
      },
      {
        content: 'After reviewing your case, I suspect there might be interference causing the Wi-Fi issues in that specific room. I\'ll be visiting your office tomorrow at 10 AM to perform signal analysis and adjust the access points if needed. Please ensure the room is available for testing.',
        role: '2. linje'
      },
      {
        content: 'Our network specialist has identified and resolved the issue. There was interference from a nearby device and we\'ve adjusted the Wi-Fi channel settings for that room. Please let us know if you experience any further issues.',
        role: '2. linje'
      },
      {
        content: 'We\'ve had two meetings in room B today and the Wi-Fi has been stable throughout. Thank you for resolving this!',
        role: 'user'
      }
    ]
  },
  {
    title: 'Request for additional monitor',
    description: 'I\'d like to request an additional monitor for my workstation. My current setup has only one screen, and I\'m finding it difficult to work efficiently with multiple applications open.',
    category: 'Hardware',
    status: 'Løst',
    priority: 'Lav',
    assignedToRole: '1. linje',
    responses: [
      {
        content: 'Thank you for your request. Could you please provide your department and manager\'s name? Also, what size and type of monitor are you currently using?',
        role: '1. linje'
      },
      {
        content: 'I\'m in the Marketing department, and my manager is Jane Smith. I currently have a 22" Dell monitor.',
        role: 'user'
      },
      {
        content: 'Thank you for the information. I\'ve checked our inventory and we have 24" Dell monitors available. I\'ve submitted a request for approval from your manager. Once approved, we\'ll arrange delivery and setup.',
        role: '1. linje'
      },
      {
        content: 'Your request has been approved. Our IT assistant will deliver and set up your new monitor tomorrow between 9-10 AM. Please ensure your workspace is accessible.',
        role: '1. linje'
      },
      {
        content: 'The new monitor was delivered and set up this morning. It\'s working great and has already made a difference in my workflow. Thank you!',
        role: 'user'
      }
    ]
  },
  {
    title: 'VPN connection failing from remote location',
    description: 'I\'m working remotely from a hotel and cannot connect to the company VPN. The connection attempt fails with the message "Connection timed out". I was able to connect yesterday from my home without issues.',
    category: 'Network',
    status: 'Løst',
    priority: 'Høy',
    assignedToRole: '2. linje',
    responses: [
      {
        content: 'Sorry to hear about the VPN issues. Let\'s try some basic troubleshooting: 1) Are you using a public or private Wi-Fi network? 2) Can you access regular websites without issues? 3) Have you tried restarting your VPN client?',
        role: '1. linje'
      },
      {
        content: 'I\'m using the hotel\'s Wi-Fi. I can access regular websites fine. I\'ve restarted the VPN client and my computer multiple times, but still get the timeout error.',
        role: 'user'
      },
      {
        content: 'Thank you for the information. Some hotels and public networks block VPN connections. I\'m going to escalate this to our network team for further assistance with an alternative connection method.',
        role: '1. linje'
      },
      {
        content: 'I\'m from the network team. We\'ll need to set you up with our alternate VPN service that works on restricted networks. Please check your email for instructions on installing and configuring the alternative VPN client.',
        role: '2. linje'
      },
      {
        content: 'I\'ve followed the instructions and installed the alternative VPN client. I can now connect successfully. Thank you for the quick solution!',
        role: 'user'
      },
      {
        content: 'Excellent! If you encounter any more issues while traveling, please don\'t hesitate to contact us. Safe travels!',
        role: '2. linje'
      }
    ]
  }
];

// Function to seed sample tickets
const seedSampleTickets = async () => {
  try {
    // Find admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Please run the seeder for admin first.');
      process.exit(1);
    }
    
    // Find or create users for 1st and 2nd line support
    let firstLineUser = await User.findOne({ role: '1. linje' });
    if (!firstLineUser) {
      firstLineUser = await User.create({
        name: '1st Line Support',
        email: 'support1@example.com',
        password: 'password123',
        role: '1. linje'
      });
      console.log('Created 1st line support user');
    }
    
    let secondLineUser = await User.findOne({ role: '2. linje' });
    if (!secondLineUser) {
      secondLineUser = await User.create({
        name: '2nd Line Support',
        email: 'support2@example.com',
        password: 'password123',
        role: '2. linje'
      });
      console.log('Created 2nd line support user');
    }
    
    // Find or create regular user
    let regularUser = await User.findOne({ role: 'user' });
    if (!regularUser) {
      regularUser = await User.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });
      console.log('Created regular user');
    }
    
    // Clear existing tickets and comments
    await Ticket.deleteMany({});
    await Comment.deleteMany({});
    
    // Create each sample ticket and its comments
    for (const sample of sampleTickets) {
      const ticket = await Ticket.create({
        title: sample.title,
        description: sample.description,
        category: sample.category,
        status: sample.status,
        priority: sample.priority,
        createdBy: regularUser._id,
        assignedToRole: sample.assignedToRole
      });
      
      // Add comments
      for (const response of sample.responses) {
        let userId;
        if (response.role === 'user') {
          userId = regularUser._id;
        } else if (response.role === '1. linje') {
          userId = firstLineUser._id;
        } else if (response.role === '2. linje') {
          userId = secondLineUser._id;
        } else {
          userId = adminUser._id;
        }
        
        await Comment.create({
          ticket: ticket._id,
          user: userId,
          content: response.content
        });
      }
      
      console.log(`Created ticket: ${ticket.title}`);
    }
    
    console.log('Sample tickets and responses seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSampleTickets();
