const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev only
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    console.log(err);
  } else {
    // In production, only log non-sensitive information
    console.error(`${err.name || 'Error'}: ${err.message}`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = { message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    // Join the array of messages into a single string
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
