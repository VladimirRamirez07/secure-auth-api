require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const UserController = {

  // ── Get Profile ─────────────────────────────────────────────
  async getProfile(req, res) {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, username, role, is_active, 
                two_factor_enabled, created_at 
         FROM users WHERE id = $1`,
        [req.user.id]
      );
      res.status(200).json({ status: 'success', data: { user: rows[0] } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // ── Update Profile ──────────────────────────────────────────
  async updateProfile(req, res) {
    try {
      const { username } = req.body;

      const { rows } = await pool.query(
        `UPDATE users SET username = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, email, username, role, updated_at`,
        [username, req.user.id]
      );

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user: rows[0] }
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ status: 'error', message: 'Username already taken' });
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // ── Change Password ─────────────────────────────────────────
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const { rows } = await pool.query(
        `SELECT password FROM users WHERE id = $1`,
        [req.user.id]
      );

      const validPassword = await bcrypt.compare(currentPassword, rows[0].password);
      if (!validPassword) {
        return res.status(401).json({ status: 'error', message: 'Current password is incorrect' });
      }

      const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(newPassword, rounds);

      await pool.query(
        `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
        [hashedPassword, req.user.id]
      );

      res.status(200).json({ status: 'success', message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};

module.exports = UserController;