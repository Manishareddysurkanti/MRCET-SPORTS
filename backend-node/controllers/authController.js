const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'college_sports_secret_key_12345!',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user (Admin or Student)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, role, rollNo, dept, year, sportCategory } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  const userRole = role === 'ADMIN' ? 'ADMIN' : 'STUDENT';

  // For students, check required profile details
  if (userRole === 'STUDENT' && (!rollNo || !dept || !year || !sportCategory)) {
    return res.status(400).json({ 
      message: 'Students must provide roll number, department, year, and sports category.' 
    });
  }

  const connection = await pool.getConnection();
  try {
    // Start Transaction
    await connection.beginTransaction();

    // Check if user exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Check roll number uniqueness for students
    if (userRole === 'STUDENT') {
      const [existingRoll] = await connection.query(
        'SELECT id FROM student_profiles WHERE roll_no = ?',
        [rollNo]
      );
      if (existingRoll.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Roll number is already registered.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    const userId = userResult.insertId;

    // Insert student profile if student
    if (userRole === 'STUDENT') {
      await connection.query(
        'INSERT INTO student_profiles (user_id, roll_no, dept, year, sport_category) VALUES (?, ?, ?, ?, ?)',
        [userId, rollNo, dept, year, sportCategory]
      );
    }

    // Commit Transaction
    await connection.commit();

    // Fetch new user info
    const [newUsers] = await connection.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    const newUser = newUsers[0];

    res.status(201).json({
      message: 'Registration successful!',
      user: newUser,
      token: generateToken(newUser)
    });
  } catch (error) {
    await connection.rollback();
    console.error('Registration transaction error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  } finally {
    connection.release();
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check for user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Remove password from response
    delete user.password;

    res.json({
      user,
      token: generateToken(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    if (req.user.role === 'STUDENT') {
      const [profiles] = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.created_at,
                s.roll_no, s.dept, s.year, s.sport_category, s.achievements, s.image_url
         FROM users u
         JOIN student_profiles s ON u.id = s.user_id
         WHERE u.id = ?`,
        [req.user.id]
      );

      if (profiles.length === 0) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      res.json(profiles[0]);
    } else {
      const [users] = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(users[0]);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, rollNo, dept, year, sportCategory, achievements, imageUrl } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Update common user fields (like name)
    if (name) {
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    }

    if (req.user.role === 'STUDENT') {
      // Update student profile details
      const [existingProfile] = await connection.query(
        'SELECT id FROM student_profiles WHERE user_id = ?',
        [req.user.id]
      );

      if (existingProfile.length === 0) {
        // Create profile if somehow not created
        await connection.query(
          `INSERT INTO student_profiles (user_id, roll_no, dept, year, sport_category, achievements, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [req.user.id, rollNo || '', dept || '', year || 1, sportCategory || '', achievements || '', imageUrl || null]
        );
      } else {
        // Verify unique roll no if it is changing
        if (rollNo) {
          const [dupRoll] = await connection.query(
            'SELECT id FROM student_profiles WHERE roll_no = ? AND user_id != ?',
            [rollNo, req.user.id]
          );
          if (dupRoll.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Roll number is already in use.' });
          }
        }

        await connection.query(
          `UPDATE student_profiles SET 
            roll_no = COALESCE(?, roll_no),
            dept = COALESCE(?, dept),
            year = COALESCE(?, year),
            sport_category = COALESCE(?, sport_category),
            achievements = COALESCE(?, achievements),
            image_url = COALESCE(?, image_url)
           WHERE user_id = ?`,
          [rollNo, dept, year, sportCategory, achievements, imageUrl, req.user.id]
        );
      }
    }

    await connection.commit();

    // Fetch updated profile to return
    let updatedUser;
    if (req.user.role === 'STUDENT') {
      const [profiles] = await pool.query(
        `SELECT u.id, u.name, u.email, u.role,
                s.roll_no, s.dept, s.year, s.sport_category, s.achievements, s.image_url
         FROM users u
         JOIN student_profiles s ON u.id = s.user_id
         WHERE u.id = ?`,
        [req.user.id]
      );
      updatedUser = profiles[0];
    } else {
      const [users] = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [req.user.id]
      );
      updatedUser = users[0];
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    await connection.rollback();
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
