/**
 *
 * Personal Information ✅
 * Bank Details
 * Notification
 * Account Verification
 * Settings
 * Security
 * Delete Account
 *
 */

const User = require('../models/User.js');
const customError = require('../utilities/customError.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');

const getUserInfo = async (req, res) => {
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

    const { password, createdAt, updatedAt, __v, ...otherCredentials } = user._doc;

    return res.status(200).json({
      status: 'success',
      profile: otherCredentials,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

/**
 * The allowedUpdates array is subject to modification & should be exposed only to Admins
 */
const updateUserInfo = async (req, res) => {
  const id = req.user.userId;
  const { userId } = req.params;

  const { ...updateObj } = req.body;
  const updateKeysArr = Object.keys(req.body);

  const allowedUpdates = ['username', 'firstName', 'lastName', 'email', 'phoneNumber'];
  const isValidOperation = updateKeysArr.every((update) => allowedUpdates.includes(update));

  console.log({ id, userId, updateObj, updateKeysArr, allowedUpdates, isValidOperation });

  try {
    if (!isValidOperation) {
      throw new customError('Invalid updates!', 403);
    }

    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== id) {
      throw new customError('User unauthorized to update resource', 401);
    }

    const filteredUpdateObj = {};
    updateKeysArr.forEach((update) => {
      if (updateObj[update] !== undefined) {
        filteredUpdateObj[update] = updateObj[update];
      }
    });

    const user = await User.findByIdAndUpdate(id, filteredUpdateObj, {
      new: true,
      runValidators: true,
    });

    if (!user) throw new customError('User not found', 404);

    console.log({ user });

    res.status(200).json({
      status: 'success',
      updatedUser: user,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const updateUserImage = async (req, res) => {
  const id = req.user.userId;
  const { userId } = req.params;

  const { imageUrl } = req.body;

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== id) {
      throw new customError('User unauthorized to update resource', 401);
    }

    if (!imageUrl) {
      throw new customError('Invalid request', 403);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { imageUrl },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) throw new customError('User not found', 404);

    res.status(200).json({
      updatedUser: user,
      status: 'success',
      message: 'Image updated successfully!',
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  updateUserImage,
};
