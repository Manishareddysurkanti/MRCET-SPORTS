const { pool } = require('../config/db');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Private
const getAllTournaments = async (req, res) => {
  try {
    const [tournaments] = await pool.query(
      `SELECT t.*, 
       (SELECT COUNT(*) FROM registrations r WHERE r.tournament_id = t.id AND r.status = 'Approved') as approved_participants,
       (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) as match_count
       FROM tournaments t 
       ORDER BY t.created_at DESC`
    );
    res.json(tournaments);
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ message: 'Server error fetching tournaments', error: error.message });
  }
};

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private (Admin Only)
const createTournament = async (req, res) => {
  const { name, sport_type } = req.body;

  if (!name || !sport_type) {
    return res.status(400).json({ message: 'Name and sport type are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tournaments (name, sport_type, status) VALUES (?, ?, ?)',
      [name, sport_type, 'Upcoming']
    );

    // Create a notification for the announcement
    await pool.query(
      'INSERT INTO notifications (title, message) VALUES (?, ?)',
      [`New Tournament: ${name}`, `Registrations are now open for the upcoming ${sport_type} tournament: "${name}". Register now!`]
    );

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament: { id: result.insertId, name, sport_type, status: 'Upcoming' }
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Server error creating tournament', error: error.message });
  }
};

// @desc    Update tournament status/details
// @route   PUT /api/tournaments/:id
// @access  Private (Admin Only)
const updateTournament = async (req, res) => {
  const { id } = req.params;
  const { name, sport_type, status } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM tournaments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    await pool.query(
      `UPDATE tournaments SET 
        name = COALESCE(?, name),
        sport_type = COALESCE(?, sport_type),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name, sport_type, status, id]
    );

    if (status && status !== existing[0].status) {
      await pool.query(
        'INSERT INTO notifications (title, message) VALUES (?, ?)',
        [`Tournament Status Update: ${name || existing[0].name}`, `The status of tournament "${name || existing[0].name}" has been updated to "${status}".`]
      );
    }

    res.json({ message: 'Tournament updated successfully' });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ message: 'Server error updating tournament', error: error.message });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Admin Only)
const deleteTournament = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM tournaments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    await pool.query('DELETE FROM tournaments WHERE id = ?', [id]);
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ message: 'Server error deleting tournament', error: error.message });
  }
};

// @desc    Register student for tournament
// @route   POST /api/tournaments/:id/register
// @access  Private (Student Only)
const registerForTournament = async (req, res) => {
  const tournamentId = req.params.id;
  const studentId = req.user.id;

  try {
    // Check if tournament exists and is not Completed
    const [tournaments] = await pool.query('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournaments[0].status === 'Completed') {
      return res.status(400).json({ message: 'Cannot register for a completed tournament' });
    }

    // Check if already registered
    const [existingReg] = await pool.query(
      'SELECT id, status FROM registrations WHERE student_id = ? AND tournament_id = ?',
      [studentId, tournamentId]
    );

    if (existingReg.length > 0) {
      return res.status(400).json({ 
        message: `You have already registered for this tournament. Status: ${existingReg[0].status}` 
      });
    }

    await pool.query(
      'INSERT INTO registrations (student_id, tournament_id, status) VALUES (?, ?, ?)',
      [studentId, tournamentId, 'Pending']
    );

    res.status(201).json({ message: 'Registration request submitted. Pending Admin approval.' });
  } catch (error) {
    console.error('Tournament registration error:', error);
    res.status(500).json({ message: 'Server error registering for tournament', error: error.message });
  }
};

// @desc    Get registrations of logged-in student
// @route   GET /api/tournaments/my-registrations
// @access  Private (Student Only)
const getStudentRegistrations = async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT r.*, t.name as tournament_name, t.sport_type, t.status as tournament_status
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.id
       WHERE r.student_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(registrations);
  } catch (error) {
    console.error('Get student registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations', error: error.message });
  }
};

module.exports = {
  getAllTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  registerForTournament,
  getStudentRegistrations
};
