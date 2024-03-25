const express = require('express');
const { getNotificationStatus, updateNotificationStatus } = require('../controllers/notifications.js');
const { authenticateUser } = require('../middlewares/authenticateUser.js');

const router = new express.Router();

router.get('/:userId', authenticateUser, getNotificationStatus);
router.put('/update/:userId', authenticateUser, updateNotificationStatus);

module.exports = { notificationRoutes: router };
