require('dotenv').config();
const { pool } = require('../config/database');

const UserModel = {

  async create({ email, password, username }) {
    const query = `
      INSERT INTO users (email, password, username)
      VALUES ($1, $2, $3)
      RETURNING id, email, username, role, is_active, created_at
    `;
    const { rows } = await pool.query(query, [email, password, username]);
    return rows[0];
  },

  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },

  async findById(id) {
    const query = `
      SELECT id, email, username, role, is_active, two_factor_enabled,
             two_factor_secret, login_attempts, locked_until, created_at 
      FROM users WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async updateLoginAttempts(email, attempts) {
    const query = `
      UPDATE users SET login_attempts = $1, updated_at = NOW()
      WHERE email = $2
    `;
    await pool.query(query, [attempts, email]);
  },

  async lockAccount(email, lockedUntil) {
    const query = `
      UPDATE users SET locked_until = $1, updated_at = NOW()
      WHERE email = $2
    `;
    await pool.query(query, [lockedUntil, email]);
  },

  async resetLoginAttempts(email) {
    const query = `
      UPDATE users 
      SET login_attempts = 0, locked_until = NULL, updated_at = NOW()
      WHERE email = $1
    `;
    await pool.query(query, [email]);
  },

  async saveRefreshToken({ userId, token, expiresAt }) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [userId, token, expiresAt]);
  },

  async findRefreshToken(token) {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1 AND expires_at > NOW()
    `;
    const { rows } = await pool.query(query, [token]);
    return rows[0];
  },

  async deleteRefreshToken(token) {
    const query = `DELETE FROM refresh_tokens WHERE token = $1`;
    await pool.query(query, [token]);
  },

  async logLoginAttempt({ email, ipAddress, success }) {
    const query = `
      INSERT INTO login_attempts (email, ip_address, success)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [email, ipAddress, success]);
  },

  async enable2FA(userId, secret) {
    const query = `
      UPDATE users 
      SET two_factor_secret = $1, two_factor_enabled = true, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [secret, userId]);
  },

  async disable2FA(userId) {
    const query = `
      UPDATE users 
      SET two_factor_secret = NULL, two_factor_enabled = false, updated_at = NOW()
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  }

};

module.exports = UserModel;