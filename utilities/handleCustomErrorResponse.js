const CustomError = require('./customError.js');
const { AxiosError } = require('axios');

const handleCustomErrorResponse = (res, error) => {
  console.error(error);

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      status: 'failure',
      message: error.message,
    });
  } else if (error instanceof ReferenceError) {
    res.status(500).json({
      status: 'failure',
      message: error.message,
    });
  } else if (error instanceof AxiosError) {
    const { response, code } = error;

    if (response && response.status) {
      res.status(response.status).json({
        status: 'failure',
        code,
        type: 'Axios error response',
        message: response.statusText || 'Unknown Axios error occurred',
      });
    } else {
      res.status(500).json({
        status: 'failure',
        message: 'Internal Server Error',
      });
    }
  } else {
    res.status(500).json({
      status: 'failure',
      message: 'Internal Server Error',
    });
  }
};

module.exports = handleCustomErrorResponse;
