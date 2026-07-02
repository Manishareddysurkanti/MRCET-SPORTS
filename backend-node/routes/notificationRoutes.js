const express = require('express');
const router = express.Router();
const { getAllNotifications, createNotification } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllNotifications)
  .post(protect, adminOnly, createNotification);

module.exports = router;
