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

      await Bank.insertMany(supportedBanks);
    }

    res.status(200).json({
      status: 'success',
      supportedBanks,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const getBankDetails = async (req, res) => {
  const id = req.user.userId;
  const { userId } = req.params;

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== id) {
      throw new customError('User unauthorized to get resource', 401);
    }

    const user = await User.findById(id);

    if (!user) throw new customError('User not found', 404);

    res.status(200).json({
      status: 'success',
      bankName: user.bankName,
      bankAccountNumber: user.bankAccountNumber,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

// Updating bank info should be a one-time-update
const updateBankDetails = async (req, res) => {
  const id = req.user.userId;
  const { userId } = req.params;

  const updates = Object.keys(req.body);
  const allowedUpdates = ['bankName', 'bankAccountNumber'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== id) {
      throw new customError('User unauthorized to get resource', 401);
    }

    if (!isValidOperation) {
      throw new customError('Invalid updates!', 400);
    }

    const user = await User.findById(id);

    if (!user) throw new customError('User not found', 404);

    console.log(user);

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Bank details updated successfully',
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const verifyBankAccount = async (req, res) => {
  const { bankName, bankAccountNumber } = req.body;

  try {
    const bank = await Bank.findOne({
      name: bankName,
    });

    if (!bank) {
      throw new customError('Bank not found', 400);
    }

    // Make a request to Paystack API to verify bank account
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${bankAccountNumber}&bank_code=${bank.code}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data;

    if (data.status === true) {
      res.status(200).json({
        status: 'success',
        message: 'Bank account verified successfully',
        data: data.data,
      });
    } else {
      res.status(400).json({
        message: 'Failed to verify bank account',
        data,
      });
      // throw new customError('Failed to verify bank account', 400);
    }
  } catch (error) {
    console.error('error:', error);
    handleCustomErrorResponse(res, error);
  }
};

module.exports = { getSupportedBanks, getBankDetails, updateBankDetails, verifyBankAccount };
