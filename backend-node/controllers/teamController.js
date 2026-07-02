const { pool } = require('../config/db');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getAllTeams = async (req, res) => {
  try {
    const [teams] = await pool.query(
      `SELECT t.*, u.name as captain_name,
              (SELECT COUNT(*) FROM team_players tp WHERE tp.team_id = t.id) as player_count
       FROM teams t
       JOIN users u ON t.captain_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error fetching teams', error: error.message });
  }
};

// @desc    Get details of a specific team (roster, captain, stats)
// @route   GET /api/teams/:id
// @access  Private
const getTeamDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const [teams] = await pool.query(
      `SELECT t.*, u.name as captain_name, u.email as captain_email
       FROM teams t
       JOIN users u ON t.captain_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (teams.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Fetch players in the team
    const [players] = await pool.query(
      `SELECT tp.student_id, u.name, u.email, sp.roll_no, sp.dept, sp.year
       FROM team_players tp
       JOIN users u ON tp.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE tp.team_id = ?`,
      [id]
    );

    res.json({
      team: teams[0],
      players
    });
  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({ message: 'Server error fetching team details', error: error.message });
  }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  const { name, sport_type, captain_id } = req.body;

  if (!name || !sport_type) {
    return res.status(400).json({ message: 'Team name and sport type are required' });
  }

  // Captain ID defaults to logged-in user if student, or must be provided if admin
  let teamCaptainId = req.user.id;
  if (req.user.role === 'ADMIN') {
    if (!captain_id) {
      return res.status(400).json({ message: 'Captain ID is required for Admins creating a team' });
    }
    teamCaptainId = captain_id;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify captain exists and is a student (captain must have student role)
    const [captainUser] = await connection.query(
      'SELECT id, role FROM users WHERE id = ?',
      [teamCaptainId]
    );

    if (captainUser.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Selected captain user does not exist' });
    }

    if (captainUser[0].role !== 'STUDENT' && req.user.role !== 'ADMIN') {
      await connection.rollback();
      return res.status(400).json({ message: 'Captain must be a student' });
    }

    // Insert team
    const [teamResult] = await connection.query(
      'INSERT INTO teams (name, captain_id, sport_type) VALUES (?, ?, ?)',
      [name, teamCaptainId, sport_type]
    );

    const teamId = teamResult.insertId;

    // Automatically add captain as a player in the team roster
    await connection.query(
      'INSERT INTO team_players (team_id, student_id) VALUES (?, ?)',
      [teamId, teamCaptainId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Team created successfully',
      team: { id: teamId, name, captain_id: teamCaptainId, sport_type }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create team error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Team name is already taken' });
    }
    res.status(500).json({ message: 'Server error creating team', error: error.message });
  } finally {
    connection.release();
  }
};

// @desc    Add a player to a team roster
// @route   POST /api/teams/:id/players
// @access  Private (Captain or Admin Only)
const addPlayer = async (req, res) => {
  const teamId = req.params.id;
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    // Fetch team
    const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (teams.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const team = teams[0];

    // Access control: Only Admin or Team Captain can modify roster
    if (req.user.role !== 'ADMIN' && team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain or Admin can add players' });
    }

    // Verify player is a Student and has profile
    const [studentCheck] = await pool.query(
      `SELECT u.id FROM users u 
       JOIN student_profiles sp ON u.id = sp.user_id 
       WHERE u.id = ? AND u.role = 'STUDENT'`,
      [student_id]
    );

    if (studentCheck.length === 0) {
      return res.status(400).json({ message: 'Invalid player. User must be a registered student.' });
    }

    // Add player to roster
    await pool.query(
      'INSERT INTO team_players (team_id, student_id) VALUES (?, ?)',
      [teamId, student_id]
    );

    res.status(200).json({ message: 'Player added to team roster successfully' });
  } catch (error) {
    console.error('Add player error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Player is already in this team roster' });
    }
    res.status(500).json({ message: 'Server error adding player to team', error: error.message });
  }
};

// @desc    Remove a player from a team roster
// @route   DELETE /api/teams/:id/players/:playerId
// @access  Private (Captain or Admin Only)
const removePlayer = async (req, res) => {
  const teamId = req.params.id;
  const playerId = req.params.playerId;

  try {
    // Fetch team
    const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (teams.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const team = teams[0];

    // Access control
    if (req.user.role !== 'ADMIN' && team.captain_id !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain or Admin can remove players' });
    }

    // Prevent captain from removing themselves (unless deleted from user system or team deleted)
    if (parseInt(playerId, 10) === team.captain_id) {
      return res.status(400).json({ message: 'Captain cannot be removed from the team roster. Disband team instead.' });
    }

    const [result] = await pool.query(
      'DELETE FROM team_players WHERE team_id = ? AND student_id = ?',
      [teamId, playerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Player not found in this team roster' });
    }

    res.json({ message: 'Player removed from team roster successfully' });
  } catch (error) {
    console.error('Remove player error:', error);
    res.status(500).json({ message: 'Server error removing player from team', error: error.message });
  }
};

module.exports = {
  getAllTeams,
  getTeamDetails,
  createTeam,
  addPlayer,
  removePlayer
};
