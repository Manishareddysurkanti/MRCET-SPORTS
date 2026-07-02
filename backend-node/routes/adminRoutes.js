const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllRegistrations,
  updateRegistrationStatus,
  getStudentsList,
  deleteStudent
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Dashboard statistics
router.get('/stats', protect, adminOnly, getDashboardStats);

// Tournament registrations
router.get('/registrations', protect, adminOnly, getAllRegistrations);
router.put('/registrations/:id', protect, adminOnly, updateRegistrationStatus);

// Student management
router.get('/students', protect, adminOnly, getStudentsList);
router.delete('/students/:id', protect, adminOnly, deleteStudent);

module.exports = router;
