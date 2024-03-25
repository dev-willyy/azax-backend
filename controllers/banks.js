const axios = require('axios');
const User = require('../models/User.js');
const Bank = require('../models/Bank.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');

const getSupportedBanks = async (req, res) => {
  try {
    let supportedBanks = await Bank.find();

    if (!supportedBanks.length) {
      const response = await axios.get('https://api.paystack.co/bank');

      supportedBanks = response.data.data.map(({ name, code, slug }) => ({
        name,
        code,
        slug,
      }));

      // Save supportedBanks to the database
      await Bank.insertMany(supportedBanks);
    }

    // Send the list of supportedBanks to the client
    res.status(200).json({
      status: 'success',
      supportedBanks,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const getBankDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      bankName: user.bankName,
      bankAccountNumber: user.bankAccountNumber,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

// Updating bank info should be a one-time-update
const updateBankDetails = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['bankName', 'bankAccountNumber'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  try {
    if (!isValidOperation) {
      throw new customError('Invalid updates!', 400);
    }

    const user = req.user;

    console.log(user);

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    res.status(200).json({
      bankName: user.bankName,
      bankAccountNumber: user.bankAccountNumber,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const verifyBankAccount = async (req, res) => {
  const { bankName, bankAccountNumber } = req.body;

  try {
    // Make a request to Paystack API to verify bank account
    const response = await axios.post(
      'https://api.paystack.co/bank/resolve',
      {
        account_number: bankAccountNumber,
        bank_code: bankName, // You may need to map bank names to their respective codes
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data;

    if (data.status === true) {
      // Bank account is verified
      res.status(200).json({
        message: 'Bank account verified successfully',
        data,
      });
    } else {
      // Bank account verification failed
      res.status(400).json({
        message: 'Failed to verify bank account',
        data,
      });
    }
  } catch (error) {
    // Handle error
    handleCustomErrorResponse(res, error);
  }
};

module.exports = { getSupportedBanks, getBankDetails, updateBankDetails, verifyBankAccount };
