const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    emailOtp: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: 'https://i.postimg.cc/hj3g9nRG/profile-avatar.png',
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model('User', userSchema);

module.exports = User;
