const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const customError = require('../utilities/customError.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new customError('Authorization token is required', 499);
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    const user = await User.findById(decoded.user.userId);

    if (!user) {
      throw new customError('Unauthorized user', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

module.exports = { authenticateUser };
