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

    // Check if the imageUrl is a default image URL
    const isDefaultImage = imageUrl === 'https://i.postimg.cc/hj3g9nRG/profile-avatar.png';

    // If it's not a default image URL, include the image path
    let imagePath = null;
    if (!isDefaultImage) {
      imagePath = path.join(__dirname, '..', 'uploads', imageUrl);
    }

    console.log({ imagePath, imageUrl });

    return res.status(200).json({
      status: 'success',
      profile: {
        ...otherCredentials,
        imageUrl, // Include the image URL in the response
        imagePath, // Include the image path in the response
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
      const maxSize = 250 * 1024; // 250KB
      if (imageSize > maxSize) {
        return res.status(400).json({
          status: 'failure',
          message: 'Image file cannot be more than 250KB',
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
          updatedUser: otherCredentials,
          status: 'success',
          message: 'Image updated successfully!',
        });
      });
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const fetchProfileImage = (req, res) => {
  const { imageUrl } = req.params;

  console.log({ imageUrl });

  const imagePath = path.join(__dirname, '..', 'uploads', imageUrl);

  console.log(imagePath);

  // Serve the image file
  res.sendFile(imagePath);
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  updateProfileImage,
  fetchProfileImage,
};
