const User = require('../models/User.js');
const customError = require('../utilities/customError.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');

const verificationParamsConfig = async (req, res, next) => {
  const id = req.user.userId;
  const { userId } = req.params;

  const {
    country,
    countryAlias,
    type,
    account_number,
    bvn,
    bank_code,
    first_name,
    last_name,
    identityDocumentNumber,
    selfiePhoto,
  } = req.body;

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== id) {
      throw new customError('User unauthorized to get resource', 401);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new customError('User not found and cannot continue verification', 404);
    }

    // Customer details to be sent in the request
    const params = {
      country: 'NG',
      type: 'bank_account',
      account_number: '0123456789',
      bvn: '200123456677',
      bank_code: '007',
      first_name: 'Asta',
      last_name: 'Lavista',
    };

    next();
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

module.exports = verificationParamsConfig;
