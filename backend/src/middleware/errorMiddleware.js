function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred while processing your request.';
  const code = err.code || 'SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}

module.exports = errorHandler;
