const express = require('express');
const { getSupportedBanks, getBankDetails, updateBankDetails, verifyBankAccount } = require('../controllers/banks.js');
const { authenticateUser } = require('../middlewares/authenticateUser.js');

const router = new express.Router();

router.get('/supported', getSupportedBanks);
router.get('/updateDetails', authenticateUser, getBankDetails);
router.put('/', authenticateUser, updateBankDetails);
router.put('/', authenticateUser, verifyBankAccount);

module.exports = { bankRoutes: router };
