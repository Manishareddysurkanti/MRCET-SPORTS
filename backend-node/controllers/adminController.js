const { pool } = require('../config/db');

// @desc    Get Admin dashboard statistics and chart data
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total counts
    const [[{ total_students }]] = await pool.query("SELECT COUNT(*) as total_students FROM users WHERE role = 'STUDENT'");
    const [[{ total_teams }]] = await pool.query("SELECT COUNT(*) as total_teams FROM teams");
    const [[{ total_matches }]] = await pool.query("SELECT COUNT(*) as total_matches FROM matches");
    const [[{ total_tournaments }]] = await pool.query("SELECT COUNT(*) as total_tournaments FROM tournaments");

    // 2. Sport breakdown (Chart 1)
    const [sportBreakdown] = await pool.query(
      `SELECT sport_category as sport, COUNT(*) as count 
       FROM student_profiles 
       GROUP BY sport_category`
    );

    // 3. Match status breakdown (Chart 2)
    const [matchStatusBreakdown] = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM matches 
       GROUP BY status`
    );

    // 4. Recent registrations
    const [recentRegistrations] = await pool.query(
      `SELECT r.*, u.name as student_name, sp.roll_no, t.name as tournament_name, t.sport_type
       FROM registrations r
       JOIN users u ON r.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN tournaments t ON r.tournament_id = t.id
       ORDER BY r.created_at DESC LIMIT 5`
    );

    res.json({
      stats: {
        students: total_students,
        teams: total_teams,
        matches: total_matches,
        tournaments: total_tournaments
      },
      charts: {
        sports: sportBreakdown,
        matches: matchStatusBreakdown
      },
      recentRegistrations
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
};

// @desc    Get all tournament registrations
// @route   GET /api/admin/registrations
// @access  Private (Admin Only)
const getAllRegistrations = async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT r.*, u.name as student_name, sp.roll_no, sp.dept, t.name as tournament_name, t.sport_type
       FROM registrations r
       JOIN users u ON r.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN tournaments t ON r.tournament_id = t.id
       ORDER BY r.created_at DESC`
    );
    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations', error: error.message });
  }
};

// @desc    Approve or reject a registration request
// @route   PUT /api/admin/registrations/:id
// @access  Private (Admin Only)
const updateRegistrationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Approved or Rejected

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid registration status' });
  }

  try {
    // Check if registration exists
    const [registration] = await pool.query(
      `SELECT r.*, t.name as tournament_name 
       FROM registrations r 
       JOIN tournaments t ON r.tournament_id = t.id 
       WHERE r.id = ?`,
      [id]
    );

    if (registration.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const reg = registration[0];

    // Update status
    await pool.query('UPDATE registrations SET status = ? WHERE id = ?', [status, id]);

    // Send user specific notification
    const title = status === 'Approved' ? 'Registration Approved' : 'Registration Rejected';
    const message = `Your registration request for "${reg.tournament_name}" has been ${status.toLowerCase()} by the Admin.`;

    await pool.query(
      'INSERT INTO notifications (title, message, user_id) VALUES (?, ?, ?)',
      [title, message, reg.student_id]
    );

    res.json({ message: `Registration request ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({ message: 'Server error updating registration', error: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin Only)
const getStudentsList = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              sp.roll_no, sp.dept, sp.year, sp.sport_category, sp.achievements, sp.image_url
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.role = 'STUDENT'
       ORDER BY u.name ASC`
    );
    res.json(students);
  } catch (error) {
    console.error('Get students list error:', error);
    res.status(500).json({ message: 'Server error fetching student list', error: error.message });
  }
};

// @desc    Delete a student (which cascades to profile)
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin Only)
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ? AND role = 'STUDENT'", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error deleting student', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllRegistrations,
  updateRegistrationStatus,
  getStudentsList,
  deleteStudent
};
