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
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired. Login afresh',
      });
    } else {
      handleCustomErrorResponse(res, error);
    }
  }
};

module.exports = { authenticateUser };
