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

const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const User = require('../models/User.js');
const customError = require('../utilities/customError.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');
require('dotenv').config();

const imageServerUrl = process.env.IMG_SERVER_ENV === 'dev' ? process.env.DEV_SERVER_URL : process.env.PROD_SERVER_URL;

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

    let imageUrl = user.imageUrl;

    const isDefaultImage = imageUrl === 'https://i.postimg.cc/hj3g9nRG/profile-avatar.png';

    let imageLink;

    if (!isDefaultImage) {
      const imageFile = fs.readFileSync(path.join(__dirname, '..', 'uploads', imageUrl));

      imageLink = `data:image/png;base64,${Buffer.from(imageFile).toString('base64')}`;
    }

    return res.status(200).json({
      status: 'success',
      profile: {
        ...otherCredentials,
        imageUrl: isDefaultImage ? imageUrl : `${imageServerUrl}/${imageUrl}`,
        imageLink,
      },
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

    const { password, createdAt, updatedAt, __v, ...otherCredentials } = user._doc;

    res.status(200).json({
      status: 'success',
      updatedUser: otherCredentials,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const updateProfileImage = async (req, res) => {
  const id = req.user.userId;
  const { userId } = req.params;

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== id) {
      throw new customError('User unauthorized to update resource', 401);
    }

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        throw new customError('Error parsing form data', 500);
      }

      const { image } = files;

      if (!image || !image.length) {
        throw new customError('Image file is required', 403);
      }

      const { filepath: tempPath, originalFilename: imageName, size: imageSize } = image[0];

      // Limiting image size
      const maxSize = 500 * 1024; // 500KB
      if (imageSize > maxSize) {
        return res.status(400).json({
          status: 'failure',
          message: 'Image file cannot be more than 500KB',
        });
      }

      const newPath = path.join(__dirname, '..', 'uploads', imageName);

      // Move the uploaded image to a permanent location
      fs.rename(tempPath, newPath, async (err) => {
        if (err) {
          return res.status(500).json({
            message: 'Error saving image',
          });
        }

        // Update user's image URL in the database
        const imageUrl = `${imageName}`;
        const user = await User.findByIdAndUpdate(id, { imageUrl }, { new: true, runValidators: true });

        if (!user) {
          throw new customError('User not found', 404);
        }

        const { password, createdAt, updatedAt, __v, ...otherCredentials } = user._doc;

        res.status(200).json({
          status: 'success',
          message: 'Image updated successfully!',
        });
      });
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

// Handle Errors appropriately here
const fetchProfileImage = (req, res) => {
  const { imageUrl } = req.params;

  const imagePath = path.join(__dirname, '..', 'uploads', imageUrl);

  // Serve the image file
  res.sendFile(imagePath);
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  updateProfileImage,
  fetchProfileImage,
};
