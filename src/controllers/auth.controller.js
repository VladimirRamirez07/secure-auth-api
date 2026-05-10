require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

const AuthController = {

  // ── Register ────────────────────────────────────────────────
  async register(req, res) {
    try {
      const { email, password, username } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Hash password
      const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, rounds);

      // Create user
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        username
      });

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // ── Login ───────────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      const lockTime = parseInt(process.env.LOCK_TIME) || 15;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        await UserModel.logLoginAttempt({ email, ipAddress, success: false });
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const minutesLeft = Math.ceil(
          (new Date(user.locked_until) - new Date()) / 60000
        );
        return res.status(423).json({
          status: 'error',
          message: `Account locked. Try again in ${minutesLeft} minutes`
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        const attempts = user.login_attempts + 1;
        await UserModel.updateLoginAttempts(email, attempts);
        await UserModel.logLoginAttempt({ email, ipAddress, success: false });

        // Lock account if max attempts reached
        if (attempts >= maxAttempts) {
          const lockedUntil = new Date(Date.now() + lockTime * 60 * 1000);
          await UserModel.lockAccount(email, lockedUntil);
          return res.status(423).json({
            status: 'error',
            message: `Too many failed attempts. Account locked for ${lockTime} minutes`
          });
        }

        return res.status(401).json({
          status: 'error',
          message: `Invalid credentials. ${maxAttempts - attempts} attempts remaining`
        });
      }

      // Reset login attempts on success
      await UserModel.resetLoginAttempts(email);
      await UserModel.logLoginAttempt({ email, ipAddress, success: true });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, user.role);

      // Save refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await UserModel.saveRefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt
      });

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
          },
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // ── Refresh Token ───────────────────────────────────────────
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ status: 'error', message: 'Refresh token required' });
      }

      // Verify token in DB
      const storedToken = await UserModel.findRefreshToken(refreshToken);
      if (!storedToken) {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' });
      }

      // Verify JWT
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await UserModel.findById(decoded.userId);

      // Generate new tokens
      const tokens = generateTokens(user.id, user.role);

      // Rotate refresh token
      await UserModel.deleteRefreshToken(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await UserModel.saveRefreshToken({
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt
      });

      res.status(200).json({
        status: 'success',
        data: tokens
      });

    } catch (error) {
      res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
    }
  },

  // ── Logout ──────────────────────────────────────────────────
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await UserModel.deleteRefreshToken(refreshToken);
      }
      res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

};

module.exports = AuthController;