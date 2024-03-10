//not found error handler

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

//error handler

const handleError = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    success: false,
    message: err?.message,
    stack: err?.stack,
  });
};

export { notFound, handleError };
