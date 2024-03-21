const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const customError = require('../utilities/customError.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    if (!token) {
      throw new customError('Authorization token is required', 499);
    }

    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    if (!decoded) {
      throw new createError('Unauthorized user', 401);
    }

    req.user = decoded.user;

    next();
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

module.exports = { authenticateUser };
