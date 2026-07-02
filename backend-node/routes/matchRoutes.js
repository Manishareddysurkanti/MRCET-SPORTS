const express = require('express');
const router = express.Router();
const {
  getAllMatches,
  getLiveMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
} = require('../controllers/matchController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get all matches & Create match
router.route('/')
  .get(protect, getAllMatches)
  .post(protect, adminOnly, createMatch);

// Get live scores (must be defined BEFORE /:id route to avoid routing collision)
router.get('/live', protect, getLiveMatches);

// Get, Update, and Delete specific match
router.route('/:id')
  .get(protect, getMatchById)
  .put(protect, adminOnly, updateMatch)
  .delete(protect, adminOnly, deleteMatch);

module.exports = router;
