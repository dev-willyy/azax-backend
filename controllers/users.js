/**
 *
 * Personal Information
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
  const { _id } = req.user;
  const { userId } = req.params;

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== _id.toString()) {
      throw new customError('User unauthorized to get resource', 401);
    }

    const user = await User.findById(req.user._id);

    if (!user) throw new customError('User not found', 404);

    return res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const updateUserInfo = async (req, res) => {
  const { _id } = req.user;
  const { userId } = req.params;

  const { ...updateObj } = req.body;
  const updateKeysArr = Object.keys(req.body);

  /**
   * The allowedUpdates array is subject to modification & should be exposed only to Admins
   */
  const allowedUpdates = ['username', 'firstName', 'lastName', 'email', 'phoneNumber'];
  const isValidOperation = updateKeysArr.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new customError('Invalid updates!', 400);
  }

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== _id.toString()) {
      throw new customError('User unauthorized to update resource', 401);
    }

    const user = await User.findById(req.user._id);

    if (!user) throw new customError('User not found', 404);

    updateKeysArr.forEach((update) => (user[update] = updateObj[update]));

    await user.save();

    res.status(200).json({
      status: 'success',
      updatedUser: user,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const updateUserImage = async (req, res) => {
  const { userId } = req.params;
  const { _id } = req.user;

  const { imageUrl } = req.body;

  console.log(userId, _id);

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== _id.toString()) {
      throw new customError('User unauthorized to update resource', 401);
    }

    const user = await User.findById(userId);

    if (!user) throw new customError('User not found', 404);

    user.imageUrl = imageUrl;
    await user.save();

    res.status(200).json({
      updatedUser: user,
      status: 'success',
      message: 'Image updated successfully!',
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

module.exports = { getUserInfo, updateUserInfo, updateUserImage };
