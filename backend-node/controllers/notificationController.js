const { pool } = require('../config/db');

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    // Return global notifications (user_id IS NULL) + user-specific notifications
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id IS NULL OR user_id = ? 
       ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
  }
};

// @desc    Broadcast a new announcement or user-specific notification
// @route   POST /api/notifications
// @access  Private (Admin Only)
const createNotification = async (req, res) => {
  const { title, message, user_id } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const targetUserId = user_id || null;

    // Check if targeted user exists if user_id is provided
    if (targetUserId) {
      const [user] = await pool.query('SELECT id FROM users WHERE id = ?', [targetUserId]);
      if (user.length === 0) {
        return res.status(400).json({ message: 'Target user does not exist' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO notifications (title, message, user_id) VALUES (?, ?, ?)',
      [title, message, targetUserId]
    );

    res.status(201).json({
      message: 'Notification created successfully',
      notification: { id: result.insertId, title, message, user_id: targetUserId }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error creating notification', error: error.message });
  }
};

module.exports = {
  getAllNotifications,
  createNotification
};
