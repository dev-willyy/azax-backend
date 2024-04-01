const axios = require('axios');
const User = require('../models/User.js');
const Bank = require('../models/Bank.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');
const customError = require('../utilities/customError.js');
const checkIsNameMatches = require('../utilities/checkIsNameMatches.js');

const getSupportedBanks = async (req, res) => {
  try {
    const response = await axios.get('https://api.paystack.co/bank');

    const { status, statusText, data } = response;

    if (status !== 200) {
      throw new customError('An error occurred while fetching banks.', 500);
    }

    const { message, data: bankData } = data;

    let banksArr = [];

    bankData.map((bank) => {
      return banksArr.push({
        id: bank.id,
        name: bank.name,
        code: bank.code,
        slug: bank.slug,
      });
    });

    return res.status(status).json({
      status: 'success',
      statusText,
      message,
      supportedBanks: banksArr,
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

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Bank details updated successfully',
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const verifyBankAccount = async (req, res) => {
  const id = req.user.userId;
  const { bankName, bankAccountNumber } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) throw new customError('User not obtainable for verification', 404);

    const bank = await Bank.findOne({
      name: bankName,
    });

    if (!bank) {
      throw new customError('Bank not found', 400);
    }

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${bankAccountNumber}&bank_code=${bank.code}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response;

    const userFullName = `${user.firstName} ${user.lastName}`;

    if (data.status === true) {
      const accountHolderName = data.data.account_name;

      if (checkIsNameMatches(userFullName, accountHolderName)) {
        return res.status(200).json({
          status: 'success',
          message: 'Bank account verified successfully',
          data: data.data,
        });
      } else {
        return res.status(400).json({
          status: 'failure',
          message: 'Bank account name does not match user full name',
        });
      }
    }
  } catch (error) {
    if (error.response?.data.type === 'validation_error' || error.response?.data.status === false) {
      return res.status(error.response.status).json({
        status: 'failure',
        message: 'Bank account verification failed. Account name cannot be resolved',
      });
    }

    handleCustomErrorResponse(res, error);
  }
};

module.exports = {
  getSupportedBanks,
  getBankDetails,
  updateBankDetails,
  verifyBankAccount,
};
