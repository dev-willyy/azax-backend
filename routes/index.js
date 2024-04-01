const { authRoutes } = require('./authRoutes.js');
const { userRoutes } = require('./userRoutes.js');
const { bankRoutes } = require('./bankRoutes.js');
const { notificationRoutes } = require('./notificationRoutes.js');
const { customerVerificationRoutes } = require('./customerVerificationRoutes.js');

module.exports = {
  authRoutes,
  userRoutes,
  bankRoutes,
  notificationRoutes,
  customerVerificationRoutes,
};
