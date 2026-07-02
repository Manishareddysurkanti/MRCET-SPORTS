const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  getTeamDetails,
  createTeam,
  addPlayer,
  removePlayer
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

// Get all teams and create team
router.route('/')
  .get(protect, getAllTeams)
  .post(protect, createTeam);

// Get specific team details (and roster)
router.get('/:id', protect, getTeamDetails);

// Add player to team roster (controller checks captain/admin access)
router.post('/:id/players', protect, addPlayer);

// Remove player from team roster (controller checks captain/admin access)
router.delete('/:id/players/:playerId', protect, removePlayer);

module.exports = router;
