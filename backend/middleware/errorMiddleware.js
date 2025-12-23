const errorHandler = (err, req, res, next) => {
  // Log the error for the developer
  console.error("🔥 Error Middleware Caught:", err.stack);

  // Determine status code (default to 500)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    msg: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
