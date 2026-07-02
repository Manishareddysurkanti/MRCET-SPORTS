const express = require('express');
const router = express.Router();
const {
  getAllTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  registerForTournament,
  getStudentRegistrations
} = require('../controllers/tournamentController');
const { protect, adminOnly, studentOnly } = require('../middleware/authMiddleware');

// Get all tournaments (any logged in user)
router.get('/', protect, getAllTournaments);

// Get student's registrations
router.get('/my-registrations', protect, studentOnly, getStudentRegistrations);

// Create tournament (Admin only)
router.post('/', protect, adminOnly, createTournament);

// Update/Delete tournament (Admin only)
router.route('/:id')
  .put(protect, adminOnly, updateTournament)
  .delete(protect, adminOnly, deleteTournament);

// Register for tournament (Student only)
router.post('/:id/register', protect, studentOnly, registerForTournament);

module.exports = router;
