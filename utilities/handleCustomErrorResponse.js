const CustomError = require('./customError.js');

const handleCustomErrorResponse = (res, error) => {
  console.error(error);

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

module.exports = handleCustomErrorResponse;
