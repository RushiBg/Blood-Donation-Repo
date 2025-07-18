const errorLogger = (err, req, res, next) => {
  console.error(err.stack);
  next(err);
};

module.exports = errorLogger; 