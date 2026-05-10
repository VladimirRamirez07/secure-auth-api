const { pool } = require('../config/database');

const AdminController = {

  // ── List All Users ──────────────────────────────────────────
  async listUsers(req, res) {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, username, role, is_active, 
                two_factor_enabled, login_attempts, created_at 
         FROM users ORDER BY created_at DESC`
      );
      res.status(200).json({
        status: 'success',
        data: { users: rows, total: rows.length }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // ── Toggle User Active Status ───────────────────────────────
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;

      if (id === req.user.id) {
        return res.status(400).json({ status: 'error', message: 'Cannot deactivate yourself' });
      }

      const { rows } = await pool.query(
        `UPDATE users SET is_active = NOT is_active, updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, username, is_active`,
        [id]
      );

      if (!rows[0]) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.status(200).json({
        status: 'success',
        message: `User ${rows[0].is_active ? 'activated' : 'deactivated'} successfully`,
        data: { user: rows[0] }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};

module.exports = AdminController;