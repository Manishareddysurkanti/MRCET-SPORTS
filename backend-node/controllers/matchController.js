const { pool } = require('../config/db');

// @desc    Get all matches (with optional filters)
// @route   GET /api/matches
// @access  Private
const getAllMatches = async (req, res) => {
  const { status, tournamentId } = req.query;
  let query = `
    SELECT m.*, 
           t.name as tournament_name, 
           t1.name as team1_name, 
           t2.name as team2_name,
           w.name as winner_name
    FROM matches m
    JOIN tournaments t ON m.tournament_id = t.id
    JOIN teams t1 ON m.team1_id = t1.id
    JOIN teams t2 ON m.team2_id = t2.id
    LEFT JOIN teams w ON m.winner_id = w.id
  `;
  const queryParams = [];

  if (status || tournamentId) {
    query += ' WHERE ';
    const conditions = [];
    if (status) {
      conditions.push('m.status = ?');
      queryParams.push(status);
    }
    if (tournamentId) {
      conditions.push('m.tournament_id = ?');
      queryParams.push(tournamentId);
    }
    query += conditions.join(' AND ');
  }

  query += ' ORDER BY m.match_date ASC, m.match_time ASC';

  try {
    const [matches] = await pool.query(query, queryParams);
    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error fetching matches', error: error.message });
  }
};

// @desc    Get live matches and scores
// @route   GET /api/matches/live
// @access  Private
const getLiveMatches = async (req, res) => {
  try {
    const [matches] = await pool.query(
      `SELECT m.*, 
              t.name as tournament_name, 
              t1.name as team1_name, 
              t2.name as team2_name
       FROM matches m
       JOIN tournaments t ON m.tournament_id = t.id
       JOIN teams t1 ON m.team1_id = t1.id
       JOIN teams t2 ON m.team2_id = t2.id
       WHERE m.status = 'Live'
       ORDER BY m.match_date ASC, m.match_time ASC`
    );
    res.json(matches);
  } catch (error) {
    console.error('Get live matches error:', error);
    res.status(500).json({ message: 'Server error fetching live matches', error: error.message });
  }
};

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Private
const getMatchById = async (req, res) => {
  const { id } = req.params;
  try {
    const [matches] = await pool.query(
      `SELECT m.*, 
              t.name as tournament_name, 
              t1.name as team1_name, 
              t2.name as team2_name,
              w.name as winner_name
       FROM matches m
       JOIN tournaments t ON m.tournament_id = t.id
       JOIN teams t1 ON m.team1_id = t1.id
       JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN teams w ON m.winner_id = w.id
       WHERE m.id = ?`,
      [id]
    );

    if (matches.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(matches[0]);
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({ message: 'Server error fetching match details', error: error.message });
  }
};

// @desc    Schedule a match
// @route   POST /api/matches
// @access  Private (Admin Only)
const createMatch = async (req, res) => {
  const { tournament_id, team1_id, team2_id, match_date, match_time } = req.body;

  if (!tournament_id || !team1_id || !team2_id || !match_date || !match_time) {
    return res.status(400).json({ message: 'All scheduling fields are required' });
  }

  if (team1_id === team2_id) {
    return res.status(400).json({ message: 'A team cannot play against itself' });
  }

  try {
    // Verify tournament and teams exist
    const [tournament] = await pool.query('SELECT name FROM tournaments WHERE id = ?', [tournament_id]);
    if (tournament.length === 0) {
      return res.status(400).json({ message: 'Invalid tournament ID' });
    }

    const [team1] = await pool.query('SELECT name FROM teams WHERE id = ?', [team1_id]);
    const [team2] = await pool.query('SELECT name FROM teams WHERE id = ?', [team2_id]);

    if (team1.length === 0 || team2.length === 0) {
      return res.status(400).json({ message: 'One or both team IDs are invalid' });
    }

    const [result] = await pool.query(
      `INSERT INTO matches (tournament_id, team1_id, team2_id, match_date, match_time, status) 
       VALUES (?, ?, ?, ?, ?, 'Upcoming')`,
      [tournament_id, team1_id, team2_id, match_date, match_time]
    );

    // Create notifications for the match
    const matchDescription = `${team1[0].name} vs ${team2[0].name} in ${tournament[0].name}`;
    await pool.query(
      `INSERT INTO notifications (title, message) 
       VALUES (?, ?)`,
      ['Match Scheduled', `A new match has been scheduled: ${matchDescription} on ${match_date} at ${match_time}.`]
    );

    res.status(201).json({
      message: 'Match scheduled successfully',
      matchId: result.insertId
    });
  } catch (error) {
    console.error('Schedule match error:', error);
    res.status(500).json({ message: 'Server error scheduling match', error: error.message });
  }
};

// @desc    Update match status and score
// @route   PUT /api/matches/:id
// @access  Private (Admin Only)
const updateMatch = async (req, res) => {
  const { id } = req.params;
  const { score_team1, score_team2, status, winner_id } = req.body;

  try {
    // Get existing match details
    const [matches] = await pool.query(
      `SELECT m.*, t1.name as team1_name, t2.name as team2_name 
       FROM matches m 
       JOIN teams t1 ON m.team1_id = t1.id
       JOIN teams t2 ON m.team2_id = t2.id
       WHERE m.id = ?`,
      [id]
    );

    if (matches.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const match = matches[0];

    // Determine values to update
    const newScore1 = score_team1 !== undefined ? score_team1 : match.score_team1;
    const newScore2 = score_team2 !== undefined ? score_team2 : match.score_team2;
    const newStatus = status || match.status;
    let newWinnerId = winner_id !== undefined ? winner_id : match.winner_id;

    // Auto-calculate winner if completed and not provided
    if (newStatus === 'Completed' && newWinnerId === null) {
      if (newScore1 > newScore2) {
        newWinnerId = match.team1_id;
      } else if (newScore2 > newScore1) {
        newWinnerId = match.team2_id;
      } else {
        newWinnerId = null; // Draw
      }
    }

    await pool.query(
      `UPDATE matches SET 
        score_team1 = ?,
        score_team2 = ?,
        status = ?,
        winner_id = ?
       WHERE id = ?`,
      [newScore1, newScore2, newStatus, newWinnerId, id]
    );

    // Send notifications if match becomes live or is completed
    if (status && status !== match.status) {
      let title = '';
      let message = '';

      if (status === 'Live') {
        title = 'Match is Live!';
        message = `The match ${match.team1_name} vs ${match.team2_name} is now LIVE. Check the scores!`;
      } else if (status === 'Completed') {
        let winnerText = 'It was a Draw!';
        if (newWinnerId === match.team1_id) {
          winnerText = `${match.team1_name} won the match!`;
        } else if (newWinnerId === match.team2_id) {
          winnerText = `${match.team2_name} won the match!`;
        }
        title = 'Match Completed';
        message = `The match ${match.team1_name} vs ${match.team2_name} finished. Final Score: ${newScore1}-${newScore2}. ${winnerText}`;
      }

      if (title) {
        await pool.query(
          'INSERT INTO notifications (title, message) VALUES (?, ?)',
          [title, message]
        );
      }
    }

    res.json({ message: 'Match updated successfully' });
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ message: 'Server error updating match', error: error.message });
  }
};

// @desc    Delete a scheduled match
// @route   DELETE /api/matches/:id
// @access  Private (Admin Only)
const deleteMatch = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM matches WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ message: 'Server error deleting match', error: error.message });
  }
};

module.exports = {
  getAllMatches,
  getLiveMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
};
