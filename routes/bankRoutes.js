const express = require('express');
const { getSupportedBanks, getBankDetails, updateBankDetails, verifyBankAccount } = require('../controllers/banks.js');
const { authenticateUser } = require('../middlewares/authenticateUser.js');

const router = new express.Router();

router.get('/supported', getSupportedBanks);
router.get('/:userId', authenticateUser, getBankDetails);
router.put('/updateDetails/:userId', authenticateUser, updateBankDetails);
router.post('/verifyDetails', authenticateUser, verifyBankAccount);

module.exports = { bankRoutes: router };
