const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Hardware',
      'Software',
      'Network',
      'Account',
      'Other'
    ]
  },
  status: {
    type: String,
    enum: ['Åpen', 'Under arbeid', 'Løst'],
    default: 'Åpen'
  },
  priority: {
    type: String,
    enum: ['lav', 'normal', 'høy', 'kritisk'],
    default: 'normal'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  assignedToRole: {
    type: String,
    enum: ['unassigned', '1. linje', '2. linje'],
    default: 'unassigned'
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  history: [
    {
      field: String,
      oldValue: String,
      newValue: String,
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    submittedAt: {
      type: Date
    }
  }
});

// Update the updatedAt field on save
TicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', TicketSchema);
