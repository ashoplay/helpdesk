const mongoose = require('mongoose');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['bruker', '1. linje', '2. linje', 'admin'],
    default: 'bruker'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using argon2
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  try {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 2**16,
      timeCost: 3,
      parallelism: 1
    });
    next();
  } catch (err) {
    next(err);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await argon2.verify(this.password, enteredPassword);
  } catch (err) {
    console.error('Password verification failed:', err);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);
