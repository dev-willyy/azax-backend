const CustomError = require('./customError.js');
const { AxiosError } = require('axios');
const { Error: MongooseError } = require('mongoose');

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
    const { data } = response;

    if (response && response.status) {
      res.status(response.status).json({
        status: data?.status || 'failure',
        code,
        type: data?.type || 'Axios error response',
        message: data?.message,
        error: response.statusText || 'Unknown Axios error occurred',
      });
    } else {
      res.status(500).json({
        status: 'failure',
        message: 'Internal Server Error',
      });
    }
  } else if (error instanceof MongooseError) {
    const { errors, message, _message } = error;

    let reason;

    if (errors && errors['settings.optInForSMSNotification']) {
      const { reason: optInReason } = errors['settings.optInForSMSNotification'];
      reason = optInReason;
    } else {
      reason;
    }

    res.status(400).json({
      status: 'failure',
      type: reason?.name,
      message: _message,
      errorValue: reason?.value,
      error: reason?.message,
      errorMessage: message,
    });
  } else {
    res.status(500).json({
      status: 'failure',
      message: 'Internal Server Error',
    });
  }
};

module.exports = handleCustomErrorResponse;
