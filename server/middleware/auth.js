const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Also check header for token (for API clients)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && 
        // Allow 1. linje and 2. linje access if that level of access is required
        !(roles.includes('1. linje') && (req.user.role === '2. linje' || req.user.role === 'admin')) && 
        !(roles.includes('2. linje') && req.user.role === 'admin')) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Modify or add this function to check role permissions including support staff
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to perform this action`
      });
    }
    next();
  };
};

// Add a specific middleware for ticket priority updates
exports.canUpdatePriority = (req, res, next) => {
  const authorizedRoles = ['admin', '1. linje', '2. linje'];
  
  if (!authorizedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Only admin and support staff can update ticket priority'
    });
  }
  next();
};
