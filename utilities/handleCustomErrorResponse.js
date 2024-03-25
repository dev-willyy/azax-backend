const CustomError = require('./customError.js');

const handleCustomErrorResponse = (res, error) => {
  // console.error(error);

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      status: 'failure',
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: 'failure',
      message: 'Internal Server Error',
    });
  }
};

module.exports = handleCustomErrorResponse;
