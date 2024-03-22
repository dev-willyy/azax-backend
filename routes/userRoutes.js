const express = require('express');
const { getUserInfo, updateUserInfo, updateProfileImage, fetchProfileImage } = require('../controllers/users.js');
const { authenticateUser } = require('../middlewares/authenticateUser.js');

const router = new express.Router();

router.get('/:userId', authenticateUser, getUserInfo);
router.put('/:userId', authenticateUser, updateUserInfo);
router.put('/image/:userId', authenticateUser, updateProfileImage);
router.get('/image/:imageUrl', fetchProfileImage);

module.exports = { userRoutes: router };
