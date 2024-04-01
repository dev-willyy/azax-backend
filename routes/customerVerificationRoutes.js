const express = require('express');
const { authenticateUser } = require('../middlewares/authenticateUser.js');
const verificationParamsConfig = require('../middlewares/verificationParamsConfig.js');
const { fetchAllSupportedCountries, verifyCustomerDetails } = require('../controllers/customerVerification.js');

const router = new express.Router();

router.get('/getSupportedCountries', fetchAllSupportedCountries);
router.get('/verify/:userId', authenticateUser, verificationParamsConfig, verifyCustomerDetails);

module.exports = { customerVerificationRoutes: router };
