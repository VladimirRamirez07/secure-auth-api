const TwoFactorService = require('../services/twoFactor.service');
const UserModel = require('../models/user.model');

const TwoFactorController = {

  // ── Setup 2FA ───────────────────────────────────────────────
  async setup(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);

      if (user.two_factor_enabled) {
        return res.status(400).json({
          status: 'error',
          message: '2FA is already enabled'
        });
      }

      const { base32, otpauth_url } = TwoFactorService.generateSecret(user.username);
      const qrCode = await TwoFactorService.generateQRCode(otpauth_url);

      // Temporarily store secret (not enabled until verified)
      await UserModel.enable2FA(user.id, base32);

      res.status(200).json({
        status: 'success',
        message: 'Scan the QR code with Google Authenticator',
        data: {
          secret: base32,
          qrCode // base64 image
        }
      });

    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // ── Verify 2FA ──────────────────────────────────────────────
  async verify(req, res) {
    try {
      const { token } = req.body;
      const user = await UserModel.findById(req.user.id);

      if (!user.two_factor_secret) {
        return res.status(400).json({
          status: 'error',
          message: '2FA not set up'
        });
      }

      const isValid = TwoFactorService.verifyToken(user.two_factor_secret, token);

      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid 2FA token'
        });
      }

      res.status(200).json({
        status: 'success',
        message: '2FA verified successfully'
      });

    } catch (error) {
      console.error('2FA verify error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  // ── Disable 2FA ─────────────────────────────────────────────
  async disable(req, res) {
    try {
      const { token } = req.body;
      const user = await UserModel.findById(req.user.id);

      const isValid = TwoFactorService.verifyToken(user.two_factor_secret, token);
      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid 2FA token'
        });
      }

      await UserModel.disable2FA(user.id);

      res.status(200).json({
        status: 'success',
        message: '2FA disabled successfully'
      });

    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

};

module.exports = TwoFactorController;